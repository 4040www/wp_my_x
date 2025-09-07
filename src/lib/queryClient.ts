import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5分鐘內不重新獲取
      staleTime: 5 * 60 * 1000,
      // 10分鐘後垃圾回收
      gcTime: 10 * 60 * 1000,
      // 重試3次
      retry: 3,
      // 窗口重新聚焦時重新獲取
      refetchOnWindowFocus: false,
    },
  },
});

// 查詢鍵常量
export const QUERY_KEYS = {
  posts: ['posts'] as const,
  post: (id: string) => ['posts', id] as const,
  notifications: ['notifications'] as const,
  search: (query: string) => ['search', query] as const,
  user: (id: string) => ['user', id] as const,
} as const;


