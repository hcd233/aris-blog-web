import { useState, useCallback, useRef, useEffect } from 'react';
import { AxiosError } from 'axios';
import { ErrorResponse } from '@/types/dto';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  initialLoading?: boolean;
}

interface UseApiReturn<TData, TError = ErrorResponse> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  execute: (...args: any[]) => Promise<TData | null>;
  reset: () => void;
}

export function useApi<TData = any, TError = ErrorResponse>(
  apiFunction: (...args: any[]) => Promise<TData>,
  options: UseApiOptions = {}
): UseApiReturn<TData, TError> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(options.initialLoading || false);
  const [error, setError] = useState<TError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<TData | null> => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, don't update state
          return null;
        }

        const error = err as AxiosError<TError>;
        const errorData = error.response?.data || ({
          error: error.message || 'An unexpected error occurred',
        } as TError);

        setError(errorData);
        options.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}