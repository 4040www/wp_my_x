import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const posts = await prisma.post.findMany({
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
        },
        reposts: {
          include: {
            author: true,
          },
        },
        repostOf: {
          include: {
            author: true,
            likes: {
              include: {
                user: true,
              },
            },
            comments: {
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, name: true, image: true } },
              },
            },
            reposts: {
              include: {
                author: true,
              },
            },
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
        likeCount: post.likes.length,
        repostCount: post.reposts.length,
        repostOf: post.repostOf
          ? {
              ...post.repostOf,
              likeCount: post.repostOf.likes.length,
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
