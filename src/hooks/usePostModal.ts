"use client";
import { useState } from "react";

export function usePostModal(
  feed?: FeedItem[],
  setFeed?: React.Dispatch<React.SetStateAction<FeedItem[]>>,
) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  async function openPostModal(postId: string) {
    setSelectedPostId(postId);

    // 如果已存在於 feed（或沒有給 setFeed），就不再抓
    const exists =
      feed?.some(
        (it) => it.post.id === postId || it.post.repostOf?.id === postId,
      ) ?? false;
    if (exists || !setFeed) return;

    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Fetch post failed");
      const data: Post = await res.json();

      // 保險的標準化
      (data as any).likeCount = (data as any).likeCount ?? 0;
      (data as any).comments = (data as any).comments ?? [];
      (data as any).reposts = (data as any).reposts ?? [];

      const newItem: FeedItem = {
        type: "post",
        createdAt: (data as any).createdAt ?? new Date().toISOString(),
        post: data,
      };

      setFeed((prev) => {
        const idx = prev.findIndex((it) => it.post.id === postId);
        if (idx >= 0) {
          // 覆蓋舊資料
          const copy = prev.slice();
          copy[idx] = newItem;
          return copy;
        }
        return [newItem, ...prev];
      });
    } catch (err) {
      console.error(err);
    }
  }

  function closePostModal() {
    setSelectedPostId(null);
  }

  return { selectedPostId, openPostModal, closePostModal, setSelectedPostId };
}
