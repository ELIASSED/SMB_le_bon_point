 // src/hooks/useApi.ts
import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState((prev) => ({ ...prev, data, loading: false }));
      return data;
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message || 'Une erreur est survenue.', loading: false }));
      throw error;
    }
  }, []);

  return { ...state, execute };
}