"use client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { swrConfig, fetcher, SWR_KEYS } from "@/lib/swr";

// 點讚變異函數
async function likePostAPI(url: string) {
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) throw new Error("Failed to like post");
  return response.json();
}

// 評論變異函數
async function commentPostAPI(
  url: string,
  { arg }: { arg: { content: string } },
) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: arg.content }),
  });
  if (!response.ok) throw new Error("Failed to comment");
  return response.json();
}

export function useSWRFeed(session: any) {
  // 獲取帖子列表
  const {
    data: feed,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR(
    session?.user?.id ? SWR_KEYS.posts : null,
    () => fetcher("/api/posts"),
    swrConfig,
  );

  // 點讚變異
  const { trigger: likePost, isMutating: isLiking } = useSWRMutation(
    SWR_KEYS.posts,
    (key, { arg }: { arg: { postId: string } }) =>
      likePostAPI(`/api/posts/${arg.postId}/like`),
    {
      onSuccess: () => {
        // 重新驗證帖子數據
        refetch();
      },
    },
  );

  // 評論變異
  const { trigger: addComment, isMutating: isCommenting } = useSWRMutation(
    SWR_KEYS.posts,
    (key, { arg }: { arg: { postId: string; content: string } }) =>
      commentPostAPI(`/api/posts/${arg.postId}/comment`, {
        arg: { content: arg.content },
      }),
    {
      onSuccess: () => {
        refetch();
      },
    },
  );

  return {
    feed: feed || [],
    isLoading,
    error,
    refetch,
    likePost,
    addComment,
    isLiking,
    isCommenting,
  };
}

// 搜索 Hook
export function useSWRSearch() {
  const { data, error, mutate } = useSWR(
    null, // 手動觸發
    fetcher,
    {
      ...swrConfig,
      revalidateOnMount: false,
    },
  );

  const search = async (query: string) => {
    if (!query.trim()) return;

    const result = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await result.json();
    mutate(data, false); // 不重新驗證，直接使用結果
    return data;
  };

  return {
    searchResults: data,
    searchError: error,
    search,
  };
}
