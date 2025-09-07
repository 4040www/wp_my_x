"use client";
import { useEffect, useRef } from "react";
import { pusherClient, getPostChannel } from "@/lib/pusher";

interface PostUpdateData {
  postId: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  liked?: boolean;
  newComment?: any;
  newRepost?: any;
  userId: string;
}

export function useRealtimePosts(
  postIds: string[],
  onPostUpdate: (data: PostUpdateData) => void
) {
  const channelsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!pusherClient || postIds.length === 0) return;

    // 订阅所有帖子的更新频道
    postIds.forEach(postId => {
      if (!channelsRef.current.has(postId)) {
        const channel = pusherClient.subscribe(getPostChannel(postId));
        channelsRef.current.set(postId, channel);

        // 监听帖子更新事件
        channel.bind('post-updated', (data: PostUpdateData) => {
          onPostUpdate(data);
        });
      }
    });

    // 清理函数
    return () => {
      channelsRef.current.forEach((channel, postId) => {
        pusherClient.unsubscribe(getPostChannel(postId));
      });
      channelsRef.current.clear();
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
