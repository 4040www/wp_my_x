"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/queryClient';

// 獲取帖子的 API 函數
async function fetchPosts() {
  const res = await fetch('/api/posts');
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

// 獲取搜索結果的 API 函數
async function fetchSearchResults(query: string) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search posts');
  return res.json();
}

// 點讚的 API 函數
async function toggleLike(postId: string) {
  const res = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

// 評論的 API 函數
async function addComment(postId: string, content: string) {
  const res = await fetch(`/api/posts/${postId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

// 轉發的 API 函數
async function repost(postId: string) {
  const res = await fetch(`/api/posts/${postId}/repost`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to repost');
  return res.json();
}

export function useOptimizedFeed(session: any) {
  const queryClient = useQueryClient();

  // 獲取帖子列表
  const {
    data: feed = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.posts,
    queryFn: fetchPosts,
    enabled: !!session?.user?.id,
  });

  // 點讚變異
  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: (data, postId) => {
      // 樂觀更新：立即更新 UI
      queryClient.setQueryData(QUERY_KEYS.posts, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((item: any) => {
          if (item.post.id === postId) {
            return {
              ...item,
              post: {
                ...item.post,
                likeCount: data.likeCount,
                liked: data.liked,
              },
            };
          }
          return item;
        });
      });
    },
    onError: (error) => {
      console.error('Like failed:', error);
      // 回滾樂觀更新
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    },
  });

  // 評論變異
  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      addComment(postId, content),
    onSuccess: (data, { postId }) => {
      // 更新帖子評論數
      queryClient.setQueryData(QUERY_KEYS.posts, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((item: any) => {
          if (item.post.id === postId) {
            return {
              ...item,
              post: {
                ...item.post,
                comments: [...(item.post.comments || []), data],
              },
            };
          }
          return item;
        });
      });
    },
  });

  // 轉發變異
  const repostMutation = useMutation({
    mutationFn: repost,
    onSuccess: (data, postId) => {
      // 更新轉發數
      queryClient.setQueryData(QUERY_KEYS.posts, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((item: any) => {
          if (item.post.id === postId) {
            return {
              ...item,
              post: {
                ...item.post,
                repostCount: (item.post.repostCount || 0) + 1,
              },
            };
          }
          return item;
        });
      });
    },
  });

  return {
    feed,
    isLoading,
    error,
    refetch,
    likeMutation,
    commentMutation,
    repostMutation,
  };
}

// 搜索 Hook
export function useOptimizedSearch() {
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: fetchSearchResults,
    onSuccess: (data, query) => {
      // 快取搜索結果
      queryClient.setQueryData(QUERY_KEYS.search(query), data);
    },
  });

  const getCachedResults = (query: string) => {
    return queryClient.getQueryData(QUERY_KEYS.search(query));
  };

  return {
    searchMutation,
    getCachedResults,
  };
}


