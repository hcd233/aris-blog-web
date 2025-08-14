import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ErrorResponse } from '@/types/dto';

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

interface UseMutationReturn<TData, TError, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: TError | null;
  reset: () => void;
}

export function useMutation<
  TData = any,
  TError = ErrorResponse,
  TVariables = void
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationReturn<TData, TError, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        
        await options.onSuccess?.(result, variables);
        options.onSettled?.(result, null, variables);
        
        return result;
      } catch (err) {
        const error = err as AxiosError<TError>;
        const errorData = error.response?.data || ({
          error: error.message || 'An unexpected error occurred',
        } as TError);

        setError(errorData);
        options.onError?.(error, variables);
        options.onSettled?.(null, error, variables);
        
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options]
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // Error is already handled in mutateAsync
      });
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    data,
    loading,
    error,
    reset,
  };
}