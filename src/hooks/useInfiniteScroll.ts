"use client";
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // 觸發加載的距離閾值
  rootMargin?: string; // 根邊距
  enabled?: boolean; // 是否啟用
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const {
    threshold = 100,
    rootMargin = '0px',
    enabled = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      await callback();
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoading(false);
    }
  }, [callback, isLoading, hasMore]);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    );

    observerRef.current = observer;
    observer.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, loadMore, rootMargin]);

  return {
    targetRef,
    isLoading,
    hasMore,
    setHasMore,
  };
}

// 分頁 Hook
export function usePagination<T>(
  initialData: T[] = [],
  pageSize: number = 10
) {
  const [data, setData] = useState<T[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadPage = useCallback(async (page: number, fetcher: (page: number) => Promise<T[]>) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const newData = await fetcher(page);
      
      if (page === 1) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }
      
      setHasMore(newData.length === pageSize);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pageSize]);

  const loadNextPage = useCallback((fetcher: (page: number) => Promise<T[]>) => {
    if (hasMore && !isLoading) {
      loadPage(currentPage + 1, fetcher);
    }
  }, [currentPage, hasMore, isLoading, loadPage]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsLoading(false);
  }, []);

  return {
    data,
    currentPage,
    hasMore,
    isLoading,
    loadNextPage,
    reset,
  };
}


