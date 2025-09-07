"use client";
import useSWR from 'swr';
import { swrConfig, fetcher, SWR_KEYS } from '@/lib/swr';
import { useState, useCallback } from 'react';

// 搜索 API 函數
async function searchPosts(query: string) {
  if (!query.trim()) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search posts');
  return res.json();
}

export function useSWRSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // 搜索結果
  const {
    data: searchResults = [],
    error,
    isLoading,
    mutate: refetch
  } = useSWR(
    searchQuery ? SWR_KEYS.search(searchQuery) : null,
    () => searchPosts(searchQuery),
    {
      ...swrConfig,
      revalidateOnMount: false,
      // 搜索結果快取 5 分鐘
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  // 執行搜索
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setHasSearched(false);
  }, []);

  // 獲取快取的搜索結果
  const getCachedResults = useCallback((query: string) => {
    if (!query.trim()) return null;
    // 這裡可以實現更複雜的快取邏輯
    return searchQuery === query ? searchResults : null;
  }, [searchQuery, searchResults]);

  return {
    searchQuery,
    searchResults,
    hasSearched,
    isLoading,
    error,
    performSearch,
    clearSearch,
    getCachedResults,
    refetch,
  };
}


