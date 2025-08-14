import { useEffect, useRef, useCallback, useState } from 'react';
import { useApi } from './useApi';
import { cacheManager, generateCacheKey } from '@/lib/cache-manager';
import { ErrorResponse } from '@/types/dto';

interface UseOptimizedQueryOptions<TData> {
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  cacheTime?: number;
  staleTime?: number;
  dedupeTime?: number;
  retryCount?: number;
  retryDelay?: number;
  cacheKey?: string;
  cacheOptions?: {
    ttl?: number;
    priority?: number;
    enablePreload?: boolean;
  };
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  // 新增选项
  backgroundRefetch?: boolean; // 是否在后台静默刷新
  prefetchOnHover?: boolean; // 是否在hover时预取
  prefetchOnVisible?: boolean; // 是否在可见时预取
}

interface UseOptimizedQueryReturn<TData, TError = ErrorResponse> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  refetch: () => Promise<TData | null>;
  isRefetching: boolean;
  isStale: boolean;
  invalidate: () => void;
}

// 请求状态管理
const requestStates = new Map<string, {
  promise: Promise<any> | null;
  timestamp: number;
  subscribers: Set<() => void>;
}>();

export function useOptimizedQuery<TData = any, TError = ErrorResponse>(
  queryKey: string | string[],
  queryFn: () => Promise<TData>,
  options: UseOptimizedQueryOptions<TData> = {}
): UseOptimizedQueryReturn<TData, TError> {
  const {
    enabled = true,
    refetchInterval,
    refetchOnWindowFocus = true,
    cacheTime = 5 * 60 * 1000,
    staleTime = 0,
    dedupeTime = 1000,
    retryCount = 3,
    retryDelay = 1000,
    cacheKey: customCacheKey,
    cacheOptions = {},
    backgroundRefetch = true,
    prefetchOnHover = false,
    prefetchOnVisible = false,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);
  const [isStale, setIsStale] = useState(false);

  const resolvedCacheKey = customCacheKey || (Array.isArray(queryKey) ? queryKey.join(':') : queryKey);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefetchingRef = useRef(false);
  const lastFocusTimeRef = useRef(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { execute } = useApi<TData, TError>(queryFn, {
    onSuccess,
    onError,
  });

  // 获取缓存数据
  const getCachedData = useCallback((): TData | null => {
    return cacheManager.get(resolvedCacheKey);
  }, [resolvedCacheKey]);

  // 带重试和去重的执行函数
  const executeWithRetry = useCallback(async (): Promise<TData | null> => {
    const now = Date.now();
    
    // 检查是否有正在进行的相同请求
    const existingState = requestStates.get(resolvedCacheKey);
    if (existingState && now - existingState.timestamp < dedupeTime) {
      // 等待现有请求完成
      return existingState.promise;
    }

    // 创建新的请求状态
    let resolvePromise: (value: TData | null) => void;
    let rejectPromise: (error: Error) => void;
    
    const requestPromise = new Promise<TData | null>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const requestState = {
      promise: requestPromise,
      timestamp: now,
      subscribers: new Set<() => void>(),
    };

    requestStates.set(resolvedCacheKey, requestState);

    // 执行请求
    const executeRequest = async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const result = await execute();
          if (result) {
            // 缓存结果
            cacheManager.set(resolvedCacheKey, result, {
              ttl: cacheOptions.ttl || cacheTime,
              priority: cacheOptions.priority || 5,
              enablePreload: cacheOptions.enablePreload || false,
            });
          }
          resolvePromise(result);
          return result;
        } catch (err) {
          lastError = err as Error;
          
          if (attempt < retryCount) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }
      
      rejectPromise(lastError!);
      throw lastError;
    };

    try {
      const result = await executeRequest();
      return result;
    } finally {
      // 清理请求状态
      requestStates.delete(resolvedCacheKey);
    }
  }, [resolvedCacheKey, execute, dedupeTime, retryCount, retryDelay, cacheOptions, cacheTime]);

  // 加载数据
  const loadData = useCallback(async (background = false) => {
    if (!enabled) return;

    const cachedData = getCachedData();
    
    if (cachedData && !background) {
      setData(cachedData);
      setError(null);
      
      // 检查是否需要后台刷新
      if (backgroundRefetch) {
        const now = Date.now();
        const cached = cacheManager['cache'].get(resolvedCacheKey);
        if (cached && now - cached.timestamp > staleTime) {
          setIsStale(true);
          // 后台刷新
          executeWithRetry().catch(() => {
            // 静默失败
          });
        }
      }
      return;
    }

    if (!background) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await executeWithRetry();
      setData(result);
      setError(null);
      setIsStale(false);
      return result;
    } catch (err) {
      if (!background) {
        setError(err as TError);
      }
      throw err;
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }, [enabled, getCachedData, backgroundRefetch, staleTime, executeWithRetry]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 定时刷新
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    intervalRef.current = setInterval(() => {
      isRefetchingRef.current = true;
      loadData(true).finally(() => {
        isRefetchingRef.current = false;
      });
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refetchInterval, loadData]);

  // 优化的窗口焦点处理
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTimeRef.current;
      
      if (timeSinceLastFocus < 1000) return;
      
      lastFocusTimeRef.current = now;
      
      const cached = cacheManager['cache'].get(resolvedCacheKey);
      if (!cached || now - cached.timestamp > staleTime) {
        isRefetchingRef.current = true;
        loadData(true).finally(() => {
          isRefetchingRef.current = false;
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, refetchOnWindowFocus, resolvedCacheKey, staleTime, loadData]);

  // Hover预取
  useEffect(() => {
    if (!enabled || !prefetchOnHover) return;

    const handleMouseEnter = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      hoverTimeoutRef.current = setTimeout(() => {
        const cached = cacheManager['cache'].get(resolvedCacheKey);
        if (!cached) {
          loadData(true);
        }
      }, 200); // 200ms延迟
    };

    const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };

    // 这里需要组件提供ref来监听hover事件
    // 实际使用时需要配合useRef和useEffect

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [enabled, prefetchOnHover, resolvedCacheKey, loadData]);

  // 可见性预取
  useEffect(() => {
    if (!enabled || !prefetchOnVisible) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cached = cacheManager['cache'].get(resolvedCacheKey);
          if (!cached) {
            loadData(true);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    // 这里需要组件提供ref来监听可见性
    // 实际使用时需要配合useRef

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, prefetchOnVisible, resolvedCacheKey, loadData]);

  const refetch = useCallback(async (): Promise<TData | null> => {
    isRefetchingRef.current = true;
    try {
      const result = await loadData();
      return result;
    } finally {
      isRefetchingRef.current = false;
    }
  }, [loadData]);

  const invalidate = useCallback(() => {
    cacheManager.delete(resolvedCacheKey);
    setData(null);
    setError(null);
    setIsStale(false);
  }, [resolvedCacheKey]);

  // 清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching: isRefetchingRef.current,
    isStale,
    invalidate,
  };
}