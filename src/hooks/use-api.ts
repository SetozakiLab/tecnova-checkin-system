import { useState, useCallback } from "react";
import { ApiResponse } from "@/types/api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: "",
  });

  const execute = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: "" }));

        const response = await fetch(url, options);
        const result: ApiResponse<T> = await response.json();

        if (!result.success) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error?.message || "API呼び出しに失敗しました",
          }));
          return null;
        }

        setState((prev) => ({
          ...prev,
          data: result.data!,
          loading: false,
          error: "",
        }));

        return result.data!;
      } catch (err) {
        console.error("API Error:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "サーバーエラーが発生しました",
        }));
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: "",
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
