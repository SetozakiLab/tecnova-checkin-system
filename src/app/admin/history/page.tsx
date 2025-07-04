"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date-utils";
import { ApiResponse, CheckinRecordData, PaginationData } from "@/types/api";

interface HistoryData {
  records: CheckinRecordData[];
  pagination: PaginationData;
}

export default function AdminHistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // フィルター
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestName, setGuestName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (guestName) params.append("guestName", guestName);

      const response = await fetch(`/api/admin/checkin-records?${params}`);
      const result: ApiResponse<HistoryData> = await response.json();

      if (!result.success) {
        setError(result.error?.message || "データの取得に失敗しました");
        return;
      }

      setData(result.data!);
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 今日の日付をデフォルトに設定
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [startDate, endDate, guestName]);

  const handleSearch = () => {
    fetchData(1);
  };

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  return (
    <AdminLayout title="入退場履歴">
      <div className="space-y-6">
        {/* 検索フィルター */}
        <Card>
          <CardHeader>
            <CardTitle>検索・フィルター</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">開始日</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">終了日</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="guestName">ゲスト名</Label>
                <Input
                  id="guestName"
                  placeholder="名前で検索"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  検索
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 履歴テーブル */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>入退場履歴</CardTitle>
            {data && (
              <div className="text-sm text-slate-600">
                {data.pagination.totalCount}件中{" "}
                {(data.pagination.page - 1) * data.pagination.limit + 1}-
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.totalCount
                )}
                件を表示
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>読み込み中...</p>
              </div>
            ) : !data || data.records.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                該当するデータがありません
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ゲスト名</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>チェックイン</TableHead>
                        <TableHead>チェックアウト</TableHead>
                        <TableHead>滞在時間</TableHead>
                        <TableHead>状態</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.guest?.name}
                          </TableCell>
                          <TableCell>{record.guest?.displayId}</TableCell>
                          <TableCell>
                            {formatDateTime(record.checkinAt)}
                          </TableCell>
                          <TableCell>
                            {record.checkoutAt
                              ? formatDateTime(record.checkoutAt)
                              : "-"}
                          </TableCell>
                          <TableCell>{record.stayDuration || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.isActive ? "default" : "secondary"
                              }
                              className={
                                record.isActive
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {record.isActive ? "滞在中" : "退場済み"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* ページネーション */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      前へ
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, data.pagination.totalPages) },
                        (_, i) => {
                          const pageNum = Math.max(1, currentPage - 2) + i;
                          if (pageNum > data.pagination.totalPages) return null;

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pageNum === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= data.pagination.totalPages}
                    >
                      次へ
                    </Button>
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
