import { useState, useCallback, useRef } from "react";
import { useEnhancedApi } from "./use-enhanced-api";

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

interface UsePaginatedDataOptions {
  limit?: number;
  initialParams?: Record<string, string>;
}

interface UsePaginatedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string;
  success: boolean;
  currentPage: number;
  pagination: PaginationData | null;
  fetchData: (
    page?: number,
    additionalParams?: Record<string, string>
  ) => Promise<void>;
  handlePageChange: (page: number) => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function usePaginatedData<T>(
  baseUrl: string,
  { limit = 20, initialParams = {} }: UsePaginatedDataOptions = {}
): UsePaginatedDataReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const currentParamsRef = useRef<Record<string, string>>(initialParams);

  const { data, loading, error, success, execute, reset: resetApi } = useEnhancedApi<T>({
    onSuccess: (result) => {
      const maybe = result as unknown;
      if (
        maybe &&
        typeof maybe === "object" &&
        "pagination" in maybe &&
        (maybe as { pagination: PaginationData }).pagination
      ) {
        setPagination((maybe as { pagination: PaginationData }).pagination);
      }
    },
    onError: () => {
      setPagination(null);
    },
  });

  const fetchData = useCallback(
    async (page = 1, additionalParams: Record<string, string> = {}) => {
      // 現在のパラメータを更新
      currentParamsRef.current = {
        ...currentParamsRef.current,
        ...additionalParams,
      };

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...currentParamsRef.current,
      });

      await execute(`${baseUrl}?${queryParams}`);
      setCurrentPage(page);
    },
    [baseUrl, limit, execute]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchData(page);
    },
    [fetchData]
  );

  const refresh = useCallback(() => {
    return fetchData(currentPage);
  }, [fetchData, currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setPagination(null);
    currentParamsRef.current = initialParams;
    resetApi();
  }, [initialParams, resetApi]);

  return {
    data,
    loading,
    error,
    success,
    currentPage,
    pagination,
    fetchData,
    handlePageChange,
    refresh,
    reset,
  };
}
