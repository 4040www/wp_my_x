"use client";
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { swrConfig, fetcher, SWR_KEYS } from '@/lib/swr';

// 獲取通知的 API 函數
async function fetchNotifications() {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

// 標記通知為已讀的 API 函數
async function markNotificationsAsRead(url: string, { arg }: { arg: { notificationIds: string[] } }) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationIds: arg.notificationIds }),
  });
  if (!res.ok) throw new Error('Failed to mark notifications as read');
  return res.json();
}

export function useSWRNotifications(session: any) {
  // 獲取通知列表
  const {
    data: notifications = [],
    error,
    isLoading,
    mutate: refetch
  } = useSWR(
    session?.user?.id ? SWR_KEYS.notifications : null,
    fetchNotifications,
    swrConfig
  );

  // 標記為已讀變異
  const { trigger: markAsRead, isMutating: isMarkingAsRead } = useSWRMutation(
    SWR_KEYS.notifications,
    markNotificationsAsRead,
    {
      onSuccess: (data, key, config) => {
        // 樂觀更新：立即更新本地狀態
        refetch((currentData: any) => {
          if (!currentData) return currentData;
          return currentData.map((notification: any) => 
            config.arg.notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          );
        }, { revalidate: false });
      },
    }
  );

  // 計算未讀通知數量
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: (notificationIds: string[]) => 
      markAsRead({ arg: { notificationIds } }),
    isMarkingAsRead,
  };
}


