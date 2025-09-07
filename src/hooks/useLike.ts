import { useState } from "react";

export function useLike(
  feed: FeedItem[],
  setFeed: React.Dispatch<React.SetStateAction<FeedItem[]>>,
  likedPosts: string[],
  setLikedPosts: React.Dispatch<React.SetStateAction<string[]>>
) {
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});

  async function handleLike(postId: string) {
    if (likeLoading[postId]) return;
    setLikeLoading((prev) => ({ ...prev, [postId]: true }));

    const isLiked = likedPosts.includes(postId);

    // 樂觀更新 likedPosts
    setLikedPosts((prev: string[]) =>
      isLiked ? prev.filter((id: string) => id !== postId) : [...prev, postId]
    );

    // 樂觀更新 feed
    setFeed((prev: FeedItem[]) =>
      prev.map((item: FeedItem) => {
        const post = item.post;
        let updatedPost = { ...post };

        if (post.id === postId) {
          updatedPost.likeCount = (post.likeCount ?? 0) + (isLiked ? -1 : 1);
        }
        if (post.repostOf?.id === postId) {
          updatedPost.repostOf = {
            ...post.repostOf,
            likeCount: (post.repostOf.likeCount ?? 0) + (isLiked ? -1 : 1),
          };
        }

        return { ...item, post: updatedPost };
      })
    );

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Like failed");
      const { liked, likeCount } = await res.json();

      setLikedPosts((prev: string[]) =>
        liked ? [...prev, postId] : prev.filter((id: string) => id !== postId)
      );

      setFeed((prev: FeedItem[]) =>
        prev.map((item: FeedItem) => {
          const post = item.post;
          let updatedPost = { ...post };
          if (post.id === postId) updatedPost.likeCount = likeCount;
          if (post.repostOf?.id === postId) {
            updatedPost.repostOf = { ...post.repostOf, likeCount };
          }
          return { ...item, post: updatedPost };
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }

  return { handleLike, likeLoading };
}
