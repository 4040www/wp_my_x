import { useState, useEffect, useCallback } from "react";

// 本地存儲快取工具
export class LocalCache {
  private static PREFIX = "my-x-cache-";
  private static DEFAULT_TTL = 5 * 60 * 1000; // 5分鐘

  // 設置快取
  static set(key: string, data: any, ttl: number = this.DEFAULT_TTL) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to set cache:", error);
    }
  }

  // 獲取快取
  static get(key: string) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      // 檢查是否過期
      if (now - parsed.timestamp > parsed.ttl) {
        this.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn("Failed to get cache:", error);
      return null;
    }
  }

  // 刪除快取
  static delete(key: string) {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.warn("Failed to delete cache:", error);
    }
  }

  // 清空所有快取
  static clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  // 獲取快取大小
  static getSize() {
    try {
      const keys = Object.keys(localStorage);
      let size = 0;
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          size += localStorage.getItem(key)?.length || 0;
        }
      });
      return size;
    } catch (error) {
      return 0;
    }
  }
}

// 快取鍵常量
export const CACHE_KEYS = {
  posts: "posts",
  notifications: "notifications",
  search: (query: string) => `search-${query}`,
  user: (id: string) => `user-${id}`,
} as const;

// 高級快取 Hook
export function useAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    fallbackToCache?: boolean;
    revalidateOnMount?: boolean;
  } = {},
) {
  const {
    ttl = LocalCache.DEFAULT_TTL,
    fallbackToCache = true,
    revalidateOnMount = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      LocalCache.set(key, result, ttl);
    } catch (err) {
      setError(err as Error);

      // 如果啟用回退到快取
      if (fallbackToCache) {
        const cached = LocalCache.get(key);
        if (cached) {
          setData(cached);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, fallbackToCache]);

  useEffect(() => {
    // 首先嘗試從快取獲取
    const cached = LocalCache.get(key);
    if (cached) {
      setData(cached);
    }

    // 如果需要重新驗證或沒有快取數據
    if (revalidateOnMount || !cached) {
      fetchData();
    }
  }, [key, fetchData, revalidateOnMount]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
