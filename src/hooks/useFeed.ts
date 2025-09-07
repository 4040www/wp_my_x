"use client";
import { useEffect, useState } from "react";

export function useFeed(session: any) {
  const [feed, setFeed] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  useEffect(() => {
    if (!session) return;
    async function fetchFeed() {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) return;
        const data = await res.json();

        const normalized = data.map((item: any) => ({
          ...item,
          post: {
            ...item.post,
            likeCount: item.post.likeCount ?? 0,
            comments: item.post.comments ?? [],
            reposts: item.post.reposts ?? [],
          },
        }));

        setFeed(normalized);
        setLikedPosts(
          normalized
            .filter(
              (i: any) =>
                i.post.likes?.some((l: any) => l.userId === session.user?.id)
            )
            .map((i: any) => i.post.id)
        );
      } catch (err) {
        console.error("Fetch feed error:", err);
      }
    }
    fetchFeed();
  }, [session]);

  return { feed, setFeed, likedPosts, setLikedPosts };
}
