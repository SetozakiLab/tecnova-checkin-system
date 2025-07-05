"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuestsTable } from "@/components/features/admin/guests-table";
import { Pagination } from "@/components/shared/pagination";
import { LoadingState } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { usePaginatedData } from "@/hooks/use-paginated-data";
import { GuestData, PaginationData } from "@/types/api";

interface GuestsData {
  guests: GuestData[];
  pagination: PaginationData;
}

export default function AdminGuestsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    data,
    loading,
    error,
    currentPage,
    pagination,
    fetchData,
    handlePageChange,
    refresh,
  } = usePaginatedData<GuestsData>("/api/admin/guests", {
    limit: 20,
  });

  // デバウンス検索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // 初回とデバウンス検索時にデータ取得
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    fetchData(1, params);
  }, [debouncedSearch]); // fetchDataを依存配列から除外

  const handleRetry = () => {
    const params: Record<string, string> = {};
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    fetchData(currentPage, params);
  };

  return (
    <AdminLayout title="ゲスト管理">
      <div className="space-y-6">
        {/* 検索 */}
        <Card>
          <CardHeader>
            <CardTitle>ゲスト検索</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">名前または連絡先で検索</Label>
                <Input
                  id="search"
                  placeholder="名前または連絡先を入力"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <ErrorState message={error} onRetry={handleRetry} />}

        {/* ゲストテーブル */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ゲスト一覧</CardTitle>
            {data && pagination && (
              <div className="text-sm text-slate-600">
                {pagination.totalCount}件中{" "}
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount
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
                <GuestsTable guests={data?.guests || []} onUpdate={refresh} />

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
