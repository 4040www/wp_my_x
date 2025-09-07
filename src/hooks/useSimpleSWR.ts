"use client";
import useSWR from "swr";
// import useSWRMutation from "swr/mutation";

// 簡單的 fetcher
const simpleFetcher = (url: string) => fetch(url).then((res) => res.json());

// 簡單的 SWR 配置
const simpleConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5000,
  errorRetryCount: 1,
};

export function useSimplePosts(session: any) {
  const {
    data: feed = [],
    error,
    isLoading,
    mutate: refetch,
  } = useSWR(
    session?.user?.id ? "/api/posts" : null,
    simpleFetcher,
    simpleConfig,
  );

  return {
    feed,
    isLoading,
    error,
    refetch,
  };
}

export function useSimpleNotifications(session: any) {
  const {
    data: notifications = [],
    error,
    isLoading,
    mutate: refetch,
  } = useSWR(
    session?.user?.id ? "/api/notifications" : null,
    simpleFetcher,
    simpleConfig,
  );

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
  };
}
