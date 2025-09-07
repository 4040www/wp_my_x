"use client";
import { useEffect, useMemo, useState } from "react";

// 你前面做過的：更新 repostCount 的工具
function bumpRepostCountInFeed(
  feed: FeedItem[],
  postId: string,
  deltaOrExact: number | { exact: number }
) {
  const bump = (v: number | undefined) =>
    typeof deltaOrExact === "number"
      ? (v ?? 0) + deltaOrExact
      : deltaOrExact.exact;

  return feed.map((item) => {
    const p = item.post;
    let np: Post = p;

    // 目標貼文本身
    if (p.id === postId) {
      np = { ...p, repostCount: bump(p.repostCount) };
    }

    // 轉發包裝，其原文是目標貼文
    if (p.repostOf?.id === postId) {
      np = {
        ...p,
        repostOf: { ...p.repostOf, repostCount: bump(p.repostOf.repostCount) },
      };
    }

    return { ...item, post: np };
  });
}

// 從 feed 推導「我已轉貼過的原文 id 集合」
function deriveMyRepostSet(feed: FeedItem[], myUserId?: string | null) {
  const set = new Set<string>();
  if (!myUserId) return set;

  for (const item of feed) {
    if (item.type !== "repost") continue;
    const wrapper = item.post; // 轉發貼文（包裝）
    const originalId = wrapper.repostOf?.id; // 原文 id
    // 判定這則轉發是不是我發的：repostedBy 或 wrapper.author 其一等於我
    const byMe =
      item.repostedBy?.id === myUserId || wrapper.author?.id === myUserId;

    if (byMe && originalId) {
      set.add(originalId);
    }
  }
  return set;
}

export function useRepost(
  feed: FeedItem[],
  setFeed: React.Dispatch<React.SetStateAction<FeedItem[]>>,
  session?: any
) {
  const [repostLoading, setRepostLoading] = useState<Record<string, boolean>>(
    {}
  );

  // 由 feed 即時計算「我已轉貼過」的 postId 集合
  const myRepostedSet = useMemo(
    () => deriveMyRepostSet(feed, session?.user?.id),
    [feed, session?.user?.id]
  );

  // 提供給外部（若你將來想把按鈕 disable 用得到）
  const hasReposted = (postId: string) => myRepostedSet.has(postId);

  async function handleRepost(postId: string) {
    // ✅ 前端防呆：已轉貼過就直接退出（不打 API，不改 UI）
    if (hasReposted(postId)) {
      // 你可改成 toast
      alert("你已經轉貼過這篇貼文");
      return;
    }

    if (repostLoading[postId]) return;
    setRepostLoading((prev) => ({ ...prev, [postId]: true }));

    // 樂觀 +1
    setFeed((prev) => bumpRepostCountInFeed(prev, postId, +1));

    try {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Repost failed");

      const newItem: FeedItem = await res.json();
      newItem.post.likeCount = newItem.post.likeCount ?? 0;
      newItem.post.comments = newItem.post.comments ?? [];
      (newItem.post as any).reposts = (newItem.post as any).reposts ?? [];

      // 若後端有精準值就覆蓋，沒有就沿用樂觀值
      const exact =
        newItem.post.repostOf?.repostCount ?? newItem.post.repostCount;

      setFeed((prev) => {
        const withNew = [newItem, ...prev];
        return typeof exact === "number"
          ? bumpRepostCountInFeed(withNew, postId, { exact })
          : withNew;
      });

      // 不需手動更新 myRepostedSet，因為它由 feed 推導；上面 prepend 後會自動反映
    } catch (err) {
      console.error(err);
      // 回滾
      setFeed((prev) => bumpRepostCountInFeed(prev, postId, -1));
    } finally {
      setRepostLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }

  return { handleRepost, repostLoading, hasReposted };
}
