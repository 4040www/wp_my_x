"use client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { swrConfig, SWR_KEYS } from "@/lib/swr";

// 獲取通知的 API 函數
async function fetchNotifications() {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

// 標記通知為已讀的 API 函數
async function markNotificationsAsRead(
  key: readonly ["notifications"],
  { arg }: { arg: { notificationIds: string[] } },
) {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationIds: arg.notificationIds }),
  });
  if (!res.ok) throw new Error("Failed to mark notifications as read");
  return res.json();
}

export function useSWRNotifications(session: any) {
  // 獲取通知列表
  const {
    data: notifications = [],
    error,
    isLoading,
    mutate: refetch,
  } = useSWR(
    session?.user?.id ? SWR_KEYS.notifications : null,
    fetchNotifications,
    swrConfig,
  );

  // 標記為已讀變異
  const { trigger: markAsRead, isMutating: isMarkingAsRead } = useSWRMutation(
    SWR_KEYS.notifications,
    markNotificationsAsRead,
    {
      onSuccess: () => {
        // 重新獲取數據以同步服務器狀態
        refetch();
      },
    },
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
      markAsRead({ notificationIds }),
    isMarkingAsRead,
  };
}
