"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { HistoryTable } from "@/components/features/admin/history-table";
import {
  SearchFilter,
  type SearchFilters,
} from "@/components/features/admin/search-filter";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppPagination as Pagination } from "@/components/ui/pagination";
import { usePaginatedData } from "@/hooks/use-paginated-data";
import type { CheckinRecord, PaginationData } from "@/types/api";

interface HistoryData {
  records: CheckinRecord[];
  pagination: PaginationData;
}

export default function AdminHistoryPage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const {
    data,
    loading,
    error,
    currentPage,
    pagination,
    fetchData,
    handlePageChange,
  } = usePaginatedData<HistoryData>("/api/admin/checkin-records", {
    limit: 20,
  });

  const convertFiltersToParams = useCallback(
    (filters: SearchFilters): Record<string, string> => {
      const params: Record<string, string> = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.guestName) params.guestName = filters.guestName;
      return params;
    },
    [],
  );

  // フィルタ適用時のフェッチをメモ化
  const runFilterFetch = useCallback(() => {
    fetchData(1, convertFiltersToParams(searchFilters));
  }, [fetchData, searchFilters, convertFiltersToParams]);

  // 初回 & フィルタ変更時に再取得 (検索 UI が setSearchFilters を呼ぶため同期)
  useEffect(() => {
    runFilterFetch();
  }, [runFilterFetch]);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters); // 更新後の effect が runFilterFetch を実行
  };

  const handleRetry = () => {
    fetchData(currentPage, convertFiltersToParams(searchFilters));
  };

  return (
    <AdminLayout title="入退場履歴">
      <div className="space-y-6">
        <SearchFilter onSearch={handleSearch} loading={loading} />

        {error && <ErrorState message={error} onRetry={handleRetry} />}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>入退場履歴</CardTitle>
            {data && pagination && (
              <div className="text-sm text-slate-600">
                {pagination.totalCount}件中{" "}
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount,
                )}
                件を表示
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState message="データを読み込み中..." size="md" />
            ) : (
              <>
                <HistoryTable
                  records={data?.records || []}
                  onUpdated={() =>
                    fetchData(
                      currentPage,
                      convertFiltersToParams(searchFilters),
                    )
                  }
                />

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      loading={loading}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
