import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    
    // 獲取分頁參數
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      take: limit,
      skip: offset,
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

    // 獲取總數用於分頁
    const totalCount = await prisma.post.count();
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: feed,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
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
