import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createNotification } from "@/lib/notifications";
import { pusherServer, getPostChannel } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;
  const { id: postId } = await params;

  try {
    let liked: boolean;

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      liked = false;
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
    } else {
      await prisma.like.create({ data: { userId, postId } });
      liked = true;
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });

      // 创建点赞通知
      await createNotification({
        type: "like",
        senderId: userId,
        postId,
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true, comments: true, reposts: true },
    });

    // 发送实时更新到所有订阅该帖子的用户
    try {
      await pusherServer.trigger(getPostChannel(postId), "post-updated", {
        postId,
        likeCount: post?.likeCount ?? 0,
        commentCount: post?.comments?.length ?? 0,
        repostCount: post?.reposts?.length ?? 0,
        liked,
        userId,
      });
    } catch (error) {
      console.error("Failed to send realtime update:", error);
    }

    return new Response(
      JSON.stringify({ liked, likeCount: post?.likeCount ?? 0, ...post }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Like API error:", err);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: err instanceof Error ? err.message : "Unknown error" 
      }), 
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
