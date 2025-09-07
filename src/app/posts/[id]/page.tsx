import { PrismaClient } from "@prisma/client";
import Header from "@/components/Header";

const prisma = new PrismaClient();

interface Props {
  params: { id: string };
}

export default async function PostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: true },
  });

  if (!post) return <div className="p-10 text-white">Post not found</div>;

  return (
    <div className="bg-[#101923] min-h-screen text-white flex flex-col">
      <Header />

      {/* 內容區垂直置中 */}
      <div className="flex-1 flex items-start justify-center px-5 py-10">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* 標題 */}
          <h1 className="text-3xl font-bold">{post.title}</h1>

          {/* 作者與日期 */}
          <p className="text-gray-400 text-sm">
            By {post.author?.name ?? "Unknown"} on{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>

          {/* 內容 */}
          <div className="text-base whitespace-pre-wrap">{post.content}</div>
        </div>
      </div>
    </div>
  );
}
