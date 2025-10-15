import { useCallback, useRef, useState } from "react";
import { useApi } from "./use-api";

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
  currentPage: number;
  pagination: PaginationData | null;
  fetchData: (
    page?: number,
    additionalParams?: Record<string, string>,
  ) => Promise<void>;
  handlePageChange: (page: number) => void;
  refresh: () => Promise<void>;
}

export function usePaginatedData<T>(
  baseUrl: string,
  { limit = 20, initialParams = {} }: UsePaginatedDataOptions = {},
): UsePaginatedDataReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const { data, loading, error, execute } = useApi<T>();
  const currentParamsRef = useRef<Record<string, string>>(initialParams);

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

      const result = await execute(`${baseUrl}?${queryParams}`);
      const maybe = result as unknown;
      if (
        maybe &&
        typeof maybe === "object" &&
        "pagination" in maybe &&
        (maybe as { pagination: PaginationData }).pagination
      ) {
        setPagination((maybe as { pagination: PaginationData }).pagination);
      }

      setCurrentPage(page);
    },
    [baseUrl, limit, execute],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchData(page);
    },
    [fetchData],
  );

  const refresh = useCallback(() => {
    return fetchData(currentPage);
  }, [fetchData, currentPage]);

  return {
    data,
    loading,
    error,
    currentPage,
    pagination,
    fetchData,
    handlePageChange,
    refresh,
  };
}
