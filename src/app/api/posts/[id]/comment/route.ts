import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createNotification } from "@/lib/notifications";
import { pusherServer, getPostChannel } from "@/lib/pusher";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const { content } = await req.json();

  if (!content || content.trim() === "") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
      },
      include: { author: true },
    });

    // 创建评论通知
    await createNotification({
      type: "comment",
      senderId: session.user.id,
      postId,
      commentId: comment.id,
    });

    // 获取更新后的帖子信息
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { comments: true, likes: true, reposts: true },
    });

    // 发送实时更新到所有订阅该帖子的用户
    try {
      await pusherServer.trigger(
        getPostChannel(postId),
        'post-updated',
        {
          postId,
          likeCount: post?.likeCount ?? 0,
          commentCount: post?.comments?.length ?? 0,
          repostCount: post?.reposts?.length ?? 0,
          newComment: comment,
          userId: session.user.id
        }
      );
    } catch (error) {
      console.error('Failed to send realtime update:', error);
    }

    return NextResponse.json(comment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
