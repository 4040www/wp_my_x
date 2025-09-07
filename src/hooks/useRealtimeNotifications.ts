"use client";
import { useEffect, useRef } from "react";
import { pusherClient, getNotificationChannel } from "@/lib/pusher";
import { useSWRNotifications } from "./useSWRNotifications";
// 通知類型定義
interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  post: {
    id: string;
    content: string | null;
    title: string | null;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  comment?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

export function useRealtimeNotifications(session: { user?: { id: string } } | null) {
  const {
    notifications,
    unreadCount,
    refetch: refetchNotifications,
  } = useSWRNotifications(session);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // 檢查 Pusher 是否正確配置
    if (!pusherClient) {
      console.warn(
        "Pusher not properly configured, skipping realtime notifications",
      );
      return;
    }

    // 訂閱用戶通知頻道
    const channel = pusherClient.subscribe(
      getNotificationChannel(session.user.id),
    );
    channelRef.current = channel;

    // 監聽新通知
    channel.bind("new-notification", () => {
      // 使用 SWR 的 mutate 來更新數據
      refetchNotifications();
    });

    // 監聽帖子更新（如點讚數變化）
    channel.bind(
      "post-updated",
      (data: { postId: string; likeCount: number; commentCount: number }) => {
        // 這裡可以更新帖子數據
        console.log("Post updated:", data);
      },
    );

    return () => {
      if (channelRef.current && pusherClient && session?.user?.id) {
        pusherClient.unsubscribe(getNotificationChannel(session.user.id));
        channelRef.current = null;
      }
    };
  }, [session?.user?.id, refetchNotifications]);

  return {
    notifications,
    unreadCount,
  };
}
