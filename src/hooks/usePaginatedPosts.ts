"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

// 分頁數據類型
interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedResponse {
  data: any[];
  pagination: PaginationInfo;
}

// 簡單的 fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 無限滾動 Hook
export function useInfinitePosts(session: any, limit: number = 10) {
  const getKey = (pageIndex: number, previousPageData: PaginatedResponse | null) => {
    // 如果沒有 session，不發送請求
    if (!session?.user?.id) return null;
    
    // 如果前一頁沒有數據或沒有下一頁，停止請求
    if (previousPageData && !previousPageData.pagination.hasNextPage) return null;
    
    // 返回 API URL
    return `/api/posts?page=${pageIndex + 1}&limit=${limit}`;
  };

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000,
    errorRetryCount: 1,
  });

  // 合併所有頁面的數據
  const allPosts = data ? data.flatMap((page) => page.data) : [];
  
  // 檢查是否還有更多數據
  const hasMore = data ? data[data.length - 1]?.pagination?.hasNextPage : false;
  
  // 載入更多數據
  const loadMore = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  }, [isValidating, hasMore, setSize, size]);

  // 重新載入
  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    posts: allPosts,
    isLoading: isLoading && !data,
    isValidating,
    error,
    hasMore,
    loadMore,
    refetch,
    totalPages: data?.[0]?.pagination?.totalPages || 0,
    totalCount: data?.[0]?.pagination?.totalCount || 0,
  };
}

// 傳統分頁 Hook
export function usePaginatedPosts(session: any, page: number = 1, limit: number = 10) {
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR(
    session?.user?.id ? `/api/posts?page=${page}&limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      errorRetryCount: 1,
    }
  );

  return {
    posts: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    error,
    refetch,
  };
}

// 無限滾動 Hook（使用 Intersection Observer）
export function useInfiniteScrollPosts(session: any, limit: number = 10) {
  const {
    posts,
    isLoading,
    isValidating,
    error,
    hasMore,
    loadMore,
    refetch,
    totalPages,
    totalCount,
  } = useInfinitePosts(session, limit);

  // 無限滾動邏輯
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // 提前 1000px 載入
      ) {
        if (hasMore && !isValidating) {
          loadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isValidating, loadMore]);

  return {
    posts,
    isLoading,
    isValidating,
    error,
    hasMore,
    loadMore,
    refetch,
    totalPages,
    totalCount,
  };
}
