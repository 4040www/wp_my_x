import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 获取用户的通知
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        post: { 
          select: { 
            id: true, 
            content: true, 
            title: true,
            author: { select: { id: true, name: true, image: true } }
          } 
        },
        comment: { 
          select: { 
            id: true, 
            content: true,
            author: { select: { id: true, name: true, image: true } }
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (err: any) {
    console.error("Get notifications error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 标记通知为已读
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationIds } = await req.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "Invalid notification IDs" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Mark notifications as read error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




