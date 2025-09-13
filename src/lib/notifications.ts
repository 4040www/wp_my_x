import { PrismaClient } from "@prisma/client";
import { pusherServer, getNotificationChannel } from "./pusher";

const prisma = new PrismaClient();

export async function createNotification({
  type,
  senderId,
  postId,
  commentId,
}: CreateNotificationParams) {
  try {
    // 获取帖子信息
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // 如果是自己操作自己的帖子，不创建通知
    if (post.authorId === senderId) {
      return null;
    }

    // 获取发送者信息
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    if (!sender) {
      throw new Error("Sender not found");
    }

    // 生成通知内容
    let content = "";
    switch (type) {
      case "like":
        content = `${sender.name} liked your post`;
        break;
      case "comment":
        content = `${sender.name} commented on your post`;
        break;
      case "repost":
        content = `${sender.name} reposted your post`;
        break;
    }

    // 创建通知
    const notification = await prisma.notification.create({
      data: {
        type,
        content,
        userId: post.authorId,
        senderId,
        postId,
        commentId,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        post: {
          select: {
            id: true,
            content: true,
            title: true,
            author: { select: { id: true, name: true, image: true } },
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            author: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    // 發送即時通知
    try {
      await pusherServer.trigger(
        getNotificationChannel(post.authorId),
        "new-notification",
        notification,
      );
    } catch (error) {
      console.error("Failed to send realtime notification:", error);
    }

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error("Get unread notification count error:", error);
    return 0;
  }
}
