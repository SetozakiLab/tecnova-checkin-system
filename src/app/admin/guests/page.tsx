"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GuestsTable } from "@/components/features/admin/guests-table";
import { Pagination } from "@/components/shared/pagination";
import { GuestsTableSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { usePaginatedData } from "@/hooks/use-paginated-data";
import { GuestData, PaginationData } from "@/types/api";
import { downloadCsv } from "@/lib/csv";
import { formatJST } from "@/lib/timezone";
import { formatGradeDisplay } from "@/domain/value-objects/grade";
import { Download, Loader2 } from "lucide-react";

interface GuestsData {
  guests: GuestData[];
  pagination: PaginationData;
}

export default function AdminGuestsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

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

  // フェッチ関数をメモ化 (fetchData 自体はカスタムフック内で安定想定だが ESLint 警告回避のため明示)
  const runSearchFetch = useCallback(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    fetchData(1, params);
  }, [debouncedSearch, fetchData]);

  // 初回とデバウンス検索時にデータ取得
  useEffect(() => {
    runSearchFetch();
  }, [runSearchFetch]);

  const handleRetry = () => {
    const params: Record<string, string> = {};
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    fetchData(currentPage, params);
  };

  const handleExportCsv = useCallback(async () => {
    try {
      setExportError("");
      setExporting(true);

      const headers = [
        "表示ID",
        "名前",
        "連絡先",
        "学年",
        "ステータス",
        "訪問回数",
        "最終訪問日時",
        "登録日時",
      ];

      const allGuests: GuestData[] = [];
      const limit = 100;
      let page = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        const response = await fetch(`/api/admin/guests?${params.toString()}`);
        const json = (await response.json()) as {
          success: boolean;
          data?: GuestsData;
          error?: { message?: string };
        };

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error?.message || "CSV出力に失敗しました");
        }

        allGuests.push(...json.data.guests);
        totalPages = json.data.pagination.totalPages;
        page += 1;
      } while (page <= totalPages);

      const rows = allGuests.map((guest) => [
        guest.displayId,
        guest.name,
        guest.contact ?? "",
        guest.grade ? formatGradeDisplay(guest.grade) : "",
        guest.isCurrentlyCheckedIn ? "滞在中" : "退場",
        guest.totalVisits ?? "",
        guest.lastVisitAt
          ? formatJST(guest.lastVisitAt, "yyyy-MM-dd HH:mm")
          : "",
        formatJST(guest.createdAt, "yyyy-MM-dd HH:mm"),
      ]);

      const fileSuffix = formatJST(new Date().toISOString(), "yyyyMMdd_HHmmss");
      downloadCsv(`guests_${fileSuffix}.csv`, headers, rows);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "CSV出力に失敗しました"
      );
    } finally {
      setExporting(false);
    }
  }, [debouncedSearch]);

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
            <div className="flex items-center gap-3">
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
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExportCsv}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exporting ? "出力中..." : "CSV出力"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exportError && (
              <div className="mb-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {exportError}
              </div>
            )}
            {loading ? (
              <GuestsTableSkeleton />
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
