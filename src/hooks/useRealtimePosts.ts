"use client";
import { useEffect, useRef } from "react";
import { pusherClient, getPostChannel } from "@/lib/pusher";
import type { Channel } from "pusher-js";

interface PostUpdateData {
  postId: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  liked?: boolean;
  newComment?: {
    id: string;
    content: string;
    author: { id: string; name: string | null; image: string | null };
  };
  newRepost?: {
    id: string;
    createdAt: string;
    author: { id: string; name: string | null; image: string | null };
  };
  userId: string;
}

export function useRealtimePosts(
  postIds: string[],
  onPostUpdate: (data: PostUpdateData) => void,
) {
  const channelsRef = useRef<Map<string, Channel>>(new Map());

  useEffect(() => {
    if (!pusherClient || postIds.length === 0) return;

    // 订阅所有帖子的更新频道
    postIds.forEach((postId) => {
      if (!channelsRef.current.has(postId)) {
        const channel = pusherClient.subscribe(getPostChannel(postId));
        channelsRef.current.set(postId, channel);

        // 监听帖子更新事件
        channel.bind("post-updated", (data: PostUpdateData) => {
          onPostUpdate(data);
        });
      }
    });

    // 清理函数
    return () => {
      const currentChannels = channelsRef.current;
      currentChannels.forEach((channel, postId) => {
        pusherClient?.unsubscribe(getPostChannel(postId));
      });
      currentChannels.clear();
    };
  }, [postIds, onPostUpdate]);

  // 清理特定帖子的订阅
  const unsubscribeFromPost = (postId: string) => {
    const channel = channelsRef.current.get(postId);
    if (channel) {
      pusherClient?.unsubscribe(getPostChannel(postId));
      channelsRef.current.delete(postId);
    }
  };

  return { unsubscribeFromPost };
}
