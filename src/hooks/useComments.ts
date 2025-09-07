import { useState } from "react";

export function useComments(
  feed: FeedItem[],
  setFeed: React.Dispatch<React.SetStateAction<FeedItem[]>>,
  session: any
) {
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>(
    {}
  );

  async function handleComment(postId: string) {
    const content = commentInput[postId]?.trim();
    if (!content || commentLoading[postId]) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));

    // 建立暫時 comment
    const tempComment: PostComment = {
      id: `temp-${Date.now()}`,
      content,
      author: { id: session?.user?.id, name: session?.user?.name },
    };

    // 樂觀更新
    setFeed((prev: FeedItem[]) =>
      prev.map((item: FeedItem) => {
        const post = item.post;
        if (post.id === postId) {
          return {
            ...item,
            post: { ...post, comments: [...post.comments, tempComment] },
          };
        }
        if (post.repostOf?.id === postId) {
          return {
            ...item,
            post: {
              ...post,
              repostOf: {
                ...post.repostOf,
                comments: [...post.repostOf.comments, tempComment],
              },
            },
          };
        }
        return item;
      })
    );
    setCommentInput((prev) => ({ ...prev, [postId]: "" }));

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Comment failed");

      const savedComment: PostComment = await res.json();

      // 用 savedComment 替換掉 temp
      setFeed((prev: FeedItem[]) =>
        prev.map((item: FeedItem) => {
          const post = item.post;
          if (post.id === postId) {
            return {
              ...item,
              post: {
                ...post,
                comments: post.comments.map((c: PostComment) =>
                  c.id.startsWith("temp-") ? savedComment : c
                ),
              },
            };
          }
          if (post.repostOf?.id === postId) {
            return {
              ...item,
              post: {
                ...post,
                repostOf: {
                  ...post.repostOf,
                  comments: post.repostOf.comments.map((c: PostComment) =>
                    c.id.startsWith("temp-") ? savedComment : c
                  ),
                },
              },
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }

  return { commentInput, setCommentInput, commentLoading, handleComment };
}
