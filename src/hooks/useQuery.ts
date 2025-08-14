import { useEffect, useRef } from 'react';
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
}

interface UseQueryReturn<TData, TError = ErrorResponse> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  refetch: () => Promise<TData | null>;
  isRefetching: boolean;
}

// Simple in-memory cache
const queryCache = new Map<string, { data: any; timestamp: number }>();

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
    onSuccess,
    onError,
  } = options;

  const cacheKey = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefetchingRef = useRef(false);

  const { data, loading, error, execute } = useApi<TData, TError>(queryFn, {
    onSuccess,
    onError,
  });

  // Check cache
  const getCachedData = (): TData | null => {
    const cached = queryCache.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cacheTime;
    if (isExpired) {
      queryCache.delete(cacheKey);
      return null;
    }

    const isStale = Date.now() - cached.timestamp > staleTime;
    return !isStale ? cached.data : null;
  };

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    const cachedData = getCachedData();
    if (cachedData) {
      // Use cached data
      return;
    }

    execute().then((result) => {
      if (result) {
        queryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }
    });
  }, [enabled, cacheKey]);

  // Refetch interval
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    intervalRef.current = setInterval(() => {
      isRefetchingRef.current = true;
      execute().then((result) => {
        if (result) {
          queryCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }
        isRefetchingRef.current = false;
      });
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refetchInterval, cacheKey]);

  // Refetch on window focus
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cached = queryCache.get(cacheKey);
      if (!cached || Date.now() - cached.timestamp > staleTime) {
        isRefetchingRef.current = true;
        execute().then((result) => {
          if (result) {
            queryCache.set(cacheKey, {
              data: result,
              timestamp: Date.now(),
            });
          }
          isRefetchingRef.current = false;
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, refetchOnWindowFocus, cacheKey, staleTime]);

  const refetch = async (): Promise<TData | null> => {
    isRefetchingRef.current = true;
    const result = await execute();
    if (result) {
      queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
    }
    isRefetchingRef.current = false;
    return result;
  };

  // Use cached data if available and not loading
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