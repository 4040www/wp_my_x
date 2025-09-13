import { SWRConfiguration } from "swr";

// SWR 全局配置
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // 2秒內重複請求會被合併
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  // 簡化錯誤重試策略
  onErrorRetry: (
    error: any,
    key: string,
    config: SWRConfiguration,
    revalidate: () => void,
    { retryCount }: { retryCount: number }
  ) => {
    // 404 錯誤不重試
    if (error.status === 404) return;
    // 最多重試 3 次
    if (retryCount >= 3) return;
  },
};

// 通用 fetcher 函數
export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });

// 帶認證的 fetcher 函數 (本專案使用 db session 這部分不會使用到)
// export const authFetcher = (url: string, token?: string) =>
//   fetch(url, {
//     headers: {
//       Authorization: token ? `Bearer ${token}` : "",
//       "Content-Type": "application/json",
//     },
//   }).then((res) => {
//     if (!res.ok) {
//       throw new Error(`HTTP error! status: ${res.status}`);
//     }
//     return res.json();
//   });

// 查詢鍵常量
export const SWR_KEYS = {
  posts: ["posts"] as const,
  post: (id: string) => ["posts", id] as const,
  notifications: ["notifications"] as const,
  search: (query: string) => ["search", query] as const,
  user: (id: string) => ["user", id] as const,
  feed: ["feed"] as const,
} as const;
