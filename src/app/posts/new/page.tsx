"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

export default function NewPostPage() {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.name) {
      alert("請先登入才能發文");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          authorId: session.user.id,
        }),
      });

      if (res.ok) {
        // const post = await res.json();
        router.push("/");
      } else {
        console.error(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="bg-[#101923] min-h-screen text-white flex flex-col">
        <Header />
      {/* 垂直置中 */}
      <div className="flex-1 flex items-start justify-center mt-20">
        <div className="w-full max-w-2xl px-5">
          {/* <h1 className="text-2xl font-bold mb-6">新增貼文</h1> */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 標題輸入 */}
            <input
              type="text"
              placeholder="標題..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                bg-transparent 
                text-white 
                placeholder:text-gray-400 
                text-2xl 
                font-bold 
                focus:outline-none
                focus:ring-0
                focus:border-none
              "
            />

            {/* 內容輸入 */}
            <textarea
              placeholder="開始輸入內容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="
                bg-transparent 
                text-white 
                placeholder:text-gray-500 
                text-base 
                resize-none 
                focus:outline-none
                focus:ring-0
                focus:border-none
                min-h-[200px]
              "
            />

            {/* 按鈕區 */}
            <div className="flex gap-4 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-white hover:bg-blue-700 text-black px-5 py-3 rounded-full shadow-lg font-semibold transition"
              >
                {loading ? "送出中..." : "送出"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-full shadow-lg font-semibold transition"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
