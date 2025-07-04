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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/date-utils";
import { ApiResponse, GuestData, PaginationData } from "@/types/api";

interface GuestsData {
  guests: GuestData[];
  pagination: PaginationData;
}

export default function AdminGuestsPage() {
  const [data, setData] = useState<GuestsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 検索・ページング
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 編集モーダル
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  const [editForm, setEditForm] = useState({ name: "", contact: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/guests?${params}`);
      const result: ApiResponse<GuestsData> = await response.json();

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
    fetchData(1);
  }, [search]);

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  const handleEditClick = (guest: GuestData) => {
    setEditingGuest(guest);
    setEditForm({
      name: guest.name,
      contact: guest.contact || "",
    });
    setEditError("");
  };

  const handleEditSubmit = async () => {
    if (!editingGuest) return;

    try {
      setEditLoading(true);
      setEditError("");

      const response = await fetch(`/api/admin/guests/${editingGuest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const result: ApiResponse<GuestData> = await response.json();

      if (!result.success) {
        setEditError(result.error?.message || "更新に失敗しました");
        return;
      }

      // データを再取得
      await fetchData(currentPage);
      setEditingGuest(null);
    } catch (err) {
      console.error("Update guest error:", err);
      setEditError("サーバーエラーが発生しました");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = async (guest: GuestData) => {
    if (
      !confirm(
        `「${guest.name}」を削除してもよろしいですか？\n※この操作は取り消せません。`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/guests/${guest.id}`, {
        method: "DELETE",
      });

      const result: ApiResponse = await response.json();

      if (!result.success) {
        alert(result.error?.message || "削除に失敗しました");
        return;
      }

      // データを再取得
      await fetchData(currentPage);
    } catch (err) {
      console.error("Delete guest error:", err);
      alert("サーバーエラーが発生しました");
    }
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
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">名前またはID</Label>
                <Input
                  id="search"
                  placeholder="名前またはIDで検索"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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

        {/* ゲストテーブル */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ゲスト一覧</CardTitle>
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
            ) : !data || data.guests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                該当するゲストが見つかりません
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名前</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>連絡先</TableHead>
                        <TableHead>来場回数</TableHead>
                        <TableHead>最終来場</TableHead>
                        <TableHead>状態</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.guests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">
                            {guest.name}
                          </TableCell>
                          <TableCell>{guest.displayId}</TableCell>
                          <TableCell>{guest.contact || "-"}</TableCell>
                          <TableCell>{guest.totalVisits || 0}回</TableCell>
                          <TableCell>
                            {guest.lastVisitAt
                              ? formatDateTime(guest.lastVisitAt)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                guest.isCurrentlyCheckedIn
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                guest.isCurrentlyCheckedIn
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {guest.isCurrentlyCheckedIn
                                ? "滞在中"
                                : "退場済み"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(guest)}
                              >
                                編集
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(guest)}
                                disabled={guest.isCurrentlyCheckedIn}
                                className="text-red-600 hover:text-red-700"
                              >
                                削除
                              </Button>
                            </div>
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

        {/* 編集モーダル */}
        {editingGuest && (
          <Dialog
            open={!!editingGuest}
            onOpenChange={() => setEditingGuest(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ゲスト情報編集</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {editError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{editError}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="editName">名前</Label>
                  <Input
                    id="editName"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    disabled={editLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="editContact">連絡先</Label>
                  <Input
                    id="editContact"
                    type="email"
                    value={editForm.contact}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contact: e.target.value })
                    }
                    disabled={editLoading}
                    placeholder="メールアドレス（任意）"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingGuest(null)}
                    disabled={editLoading}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleEditSubmit}
                    disabled={editLoading || !editForm.name.trim()}
                  >
                    {editLoading ? "更新中..." : "更新"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}
