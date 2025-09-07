import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    const searchTerm = query.trim();

    // 搜索帖子内容或作者名称
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            author: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
          {
            repostOf: {
              content: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
          {
            repostOf: {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
          {
            repostOf: {
              author: {
                name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
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
    console.error("Search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
