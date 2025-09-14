// /app/api/posts/[id]/repost/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createNotification } from "@/lib/notifications";
import { pusherServer, getPostChannel } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: originalPostId } = await params;

    // 1. 檢查原始貼文是否存在
    const originalPost = await prisma.post.findUnique({
      where: { id: originalPostId },
      include: { author: true, likes: true, reposts: true, comments: true },
    });
    if (!originalPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. 檢查是否已經轉發過
    const existingRepost = await prisma.post.findFirst({
      where: { authorId: userId, repostOfId: originalPostId },
      include: {
        author: true,
        repostOf: {
          include: { author: true, likes: true, reposts: true, comments: true },
        },
      },
    });

    if (existingRepost) {
      return NextResponse.json({
        type: "repost" as const,
        createdAt: existingRepost.createdAt,
        post: existingRepost.repostOf,
        repostedBy: {
          id: existingRepost.author.id,
          name: existingRepost.author.name,
          image: existingRepost.author.image,
        },
      });
    }

    // 3. 建立轉發
    const repost = await prisma.post.create({
      data: {
        authorId: userId,
        repostOfId: originalPostId,
      },
      include: {
        author: true,
        repostOf: {
          include: { author: true, likes: true, reposts: true, comments: true },
        },
      },
    });

    // 创建转发通知
    await createNotification({
      type: "repost",
      senderId: userId,
      postId: originalPostId,
    });

    // 获取更新后的帖子信息
    const updatedPost = await prisma.post.findUnique({
      where: { id: originalPostId },
      include: { comments: true, likes: true, reposts: true },
    });

    // 发送实时更新到所有订阅该帖子的用户
    try {
      await pusherServer.trigger(
        getPostChannel(originalPostId),
        "post-updated",
        {
          postId: originalPostId,
          likeCount: updatedPost?.likeCount ?? 0,
          commentCount: updatedPost?.comments?.length ?? 0,
          repostCount: updatedPost?.reposts?.length ?? 0,
          newRepost: repost,
          userId,
        },
      );
    } catch (error) {
      console.error("Failed to send realtime update:", error);
    }

    return NextResponse.json({
      type: "repost" as const,
      createdAt: repost.createdAt,
      post: repost.repostOf,
      repostedBy: {
        id: repost.author.id,
        name: repost.author.name,
        image: repost.author.image,
      },
      repost: repost, // 返回完整的轉發貼文信息
    });
  } catch (err) {
    console.error("Repost error:", err);
    return NextResponse.json({ error: "Failed to repost" }, { status: 500 });
  }
}
