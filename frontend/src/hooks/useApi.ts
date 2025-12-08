import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { handleApiError } from '@/utils/errorHandler';

interface UseApiOptions {
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for API calls
 */
export const useApi = <T,>(
  url: string,
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { autoFetch = true, onSuccess, onError } = options;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<T>(url);
      setData(response.data);
      onSuccess?.(response.data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      onError?.(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    data,
    error,
    isLoading,
    refetch: fetch,
  };
};
