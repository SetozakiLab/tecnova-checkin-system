import { useState, useCallback } from "react";
import { ApiResponse } from "@/types/api";

interface UseEnhancedApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  success: boolean;
}

interface UseEnhancedApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  throwOnError?: boolean;
}

interface UseEnhancedApiReturn<T> extends UseEnhancedApiState<T> {
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
  refetch: () => Promise<T | null>;
}

export function useEnhancedApi<T = unknown>(
  options: UseEnhancedApiOptions = {}
): UseEnhancedApiReturn<T> {
  const { onSuccess, onError, throwOnError = false } = options;
  
  const [state, setState] = useState<UseEnhancedApiState<T>>({
    data: null,
    loading: false,
    error: "",
    success: false,
  });

  const [lastRequest, setLastRequest] = useState<{
    url: string;
    options?: RequestInit;
  } | null>(null);

  const execute = useCallback(
    async (url: string, requestOptions?: RequestInit): Promise<T | null> => {
      try {
        setState((prev) => ({ 
          ...prev, 
          loading: true, 
          error: "", 
          success: false 
        }));

        // Store request for refetch capability
        setLastRequest({ url, options: requestOptions });

        const response = await fetch(url, requestOptions);
        const result: ApiResponse<T> = await response.json();

        if (!result.success) {
          const errorMessage = result.error?.message || "API呼び出しに失敗しました";
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
            success: false,
          }));
          
          if (onError) onError(errorMessage);
          if (throwOnError) throw new Error(errorMessage);
          return null;
        }

        setState((prev) => ({
          ...prev,
          data: result.data!,
          loading: false,
          error: "",
          success: true,
        }));

        if (onSuccess) onSuccess(result.data);
        return result.data!;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "サーバーエラーが発生しました";
        console.error("Enhanced API Error:", err);
        
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
        }));

        if (onError) onError(errorMessage);
        if (throwOnError) throw err;
        return null;
      }
    },
    [onSuccess, onError, throwOnError]
  );

  const refetch = useCallback(async (): Promise<T | null> => {
    if (!lastRequest) {
      console.warn("No previous request to refetch");
      return null;
    }
    return execute(lastRequest.url, lastRequest.options);
  }, [execute, lastRequest]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: "",
      success: false,
    });
    setLastRequest(null);
  }, []);

  return {
    ...state,
    execute,
    reset,
    refetch,
  };
}