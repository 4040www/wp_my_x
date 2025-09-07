import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        likes: true,
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
        },
        reposts: true,
        repostOf: {
          include: {
            author: true,
            likes: true,
            comments: {
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, name: true, image: true } },
              },
            },
            reposts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const feed = posts.map((post) => ({
      type: post.repostOfId ? "repost" : "post",
      createdAt: post.createdAt,
      post: {
        ...post,
        repostCount: post.reposts.length,
        repostOf: post.repostOf
          ? {
              ...post.repostOf,
              repostCount: post.repostOf.reposts.length,
            }
          : null,
      },
    }));

    return NextResponse.json(feed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 新增貼文
export async function POST(req: Request) {
  try {
    const { title, content, authorId, repostOfId } = await req.json();

    if (!authorId) {
      return NextResponse.json({ error: "Missing authorId" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
        repostOfId: repostOfId ?? null,
      },
      include: { author: true, reposts: true, comments: true },
    });

    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
