import { useEffect, useRef, useCallback } from 'react';
import { useApi } from './useApi';
import { ErrorResponse } from '@/types/dto';

interface UseQueryOptions<TData> {
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  cacheTime?: number;
  staleTime?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  // 新增选项
  dedupeTime?: number; // 去重时间窗口
  retryCount?: number; // 重试次数
  retryDelay?: number; // 重试延迟
}

interface UseQueryReturn<TData, TError = ErrorResponse> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  refetch: () => Promise<TData | null>;
  isRefetching: boolean;
}

// 增强的缓存项接口
interface CacheItem<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  error?: Error;
}

// 请求状态管理
interface RequestState {
  promise: Promise<any> | null;
  timestamp: number;
}

// 全局缓存和请求状态管理
const queryCache = new Map<string, CacheItem<any>>();
const pendingRequests = new Map<string, RequestState>();

// 缓存清理函数
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, item] of queryCache.entries()) {
    // 清理过期的缓存项
    if (now - item.timestamp > 30 * 60 * 1000) { // 30分钟
      queryCache.delete(key);
    }
  }
};

// 定期清理缓存
setInterval(cleanupCache, 5 * 60 * 1000); // 每5分钟清理一次

export function useQuery<TData = any, TError = ErrorResponse>(
  queryKey: string | string[],
  queryFn: () => Promise<TData>,
  options: UseQueryOptions<TData> = {}
): UseQueryReturn<TData, TError> {
  const {
    enabled = true,
    refetchInterval,
    refetchOnWindowFocus = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 0,
    dedupeTime = 1000, // 1 second
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const cacheKey = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefetchingRef = useRef(false);
  const lastFocusTimeRef = useRef(0);

  const { data, loading, error, execute } = useApi<TData, TError>(queryFn, {
    onSuccess,
    onError,
  });

  // 获取缓存数据的增强版本
  const getCachedData = useCallback((): TData | null => {
    const cached = queryCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > cacheTime;
    
    if (isExpired) {
      queryCache.delete(cacheKey);
      return null;
    }

    // 更新访问统计
    cached.lastAccessed = now;
    cached.accessCount++;

    const isStale = now - cached.timestamp > staleTime;
    return !isStale ? cached.data : null;
  }, [cacheKey, cacheTime, staleTime]);

  // 带重试和去重的执行函数
  const executeWithRetry = useCallback(async (): Promise<TData | null> => {
    const now = Date.now();
    
    // 检查是否有正在进行的相同请求
    const pendingRequest = pendingRequests.get(cacheKey);
    if (pendingRequest && now - pendingRequest.timestamp < dedupeTime) {
      // 返回正在进行的请求
      return pendingRequest.promise;
    }

    // 创建新的请求
    const executePromise = (async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const result = await execute();
          if (result) {
            // 缓存成功的结果
            queryCache.set(cacheKey, {
              data: result,
              timestamp: now,
              lastAccessed: now,
              accessCount: 1,
            });
          }
          return result;
        } catch (err) {
          lastError = err as Error;
          
          if (attempt < retryCount) {
            // 等待重试延迟
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }
      
      // 缓存错误结果（短期）
      queryCache.set(cacheKey, {
        data: null as any,
        timestamp: now,
        lastAccessed: now,
        accessCount: 1,
        error: lastError,
      });
      
      throw lastError;
    })();

    // 记录正在进行的请求
    pendingRequests.set(cacheKey, {
      promise: executePromise,
      timestamp: now,
    });

    try {
      const result = await executePromise;
      return result;
    } finally {
      // 清理已完成的请求
      pendingRequests.delete(cacheKey);
    }
  }, [cacheKey, execute, dedupeTime, retryCount, retryDelay]);

  // 初始获取
  useEffect(() => {
    if (!enabled) return;

    const cachedData = getCachedData();
    if (cachedData) {
      // 使用缓存数据，但检查是否需要后台刷新
      const now = Date.now();
      const cached = queryCache.get(cacheKey);
      if (cached && now - cached.timestamp > staleTime) {
        // 后台刷新数据
        executeWithRetry().catch(() => {
          // 静默失败，继续使用缓存数据
        });
      }
      return;
    }

    executeWithRetry();
  }, [enabled, cacheKey, getCachedData, executeWithRetry, staleTime]);

  // 定时刷新
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    intervalRef.current = setInterval(() => {
      isRefetchingRef.current = true;
      executeWithRetry().finally(() => {
        isRefetchingRef.current = false;
      });
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refetchInterval, executeWithRetry]);

  // 优化的窗口焦点处理
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTimeRef.current;
      
      // 防止频繁的焦点事件触发请求
      if (timeSinceLastFocus < 1000) return;
      
      lastFocusTimeRef.current = now;
      
      const cached = queryCache.get(cacheKey);
      if (!cached || now - cached.timestamp > staleTime) {
        isRefetchingRef.current = true;
        executeWithRetry().finally(() => {
          isRefetchingRef.current = false;
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, refetchOnWindowFocus, cacheKey, staleTime, executeWithRetry]);

  const refetch = useCallback(async (): Promise<TData | null> => {
    isRefetchingRef.current = true;
    try {
      const result = await executeWithRetry();
      return result;
    } finally {
      isRefetchingRef.current = false;
    }
  }, [executeWithRetry]);

  // 使用缓存数据（如果可用且不在加载中）
  const cachedData = getCachedData();
  const finalData = data || cachedData;

  return {
    data: finalData,
    loading: loading && !finalData,
    error,
    refetch,
    isRefetching: isRefetchingRef.current,
  };
}