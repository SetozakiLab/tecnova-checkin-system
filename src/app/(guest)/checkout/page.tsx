"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ApiResponse, CheckinRecord, GuestData } from "@/types/api";
import { useCheckinActions } from "@/hooks/use-checkin-actions";
import { formatTime, formatStayDuration } from "@/lib/date-utils";
import { LogOut } from "lucide-react";

export default function CheckoutPage() {
  const { loading, handleCheckout } = useCheckinActions();
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<CheckinRecord | null>(null);

  const fetchCurrent = async () => {
    try {
      setLoadingList(true);
      setListError("");
      const res = await fetch("/api/checkins/current");
      const result: ApiResponse<CheckinRecord[]> = await res.json();
      if (!result.success) {
        setListError(result.error?.message || "一覧の取得に失敗しました");
        return;
      }
      setRecords(result.data || []);
    } catch {
      setListError("サーバーエラーが発生しました");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.guestName, r.guestDisplayId?.toString()].some((v) =>
        (v || "").toString().toLowerCase().includes(q)
      )
    );
  }, [records, search]);

  const openConfirm = (record: CheckinRecord) => {
    setSelected(record);
    setConfirmOpen(true);
  };

  const confirmCheckout = async () => {
    if (!selected) return;
    const guest: GuestData = {
      id: selected.guestId,
      displayId: selected.guestDisplayId,
      name: selected.guestName,
      createdAt: new Date().toISOString(),
      isCurrentlyCheckedIn: true,
    };
    await handleCheckout(guest);
    setConfirmOpen(false);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold text-indigo-800">tec-nova</h1>
            <p className="text-lg text-indigo-600">入退場管理システム</p>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">退場手続き</h2>
        </div>

        <Card className="border-2 border-indigo-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl">現在入場中の一覧</CardTitle>
                <CardDescription>
                  {loadingList ? "読み込み中..." : `${filtered.length} 件表示`}
                </CardDescription>
              </div>
              <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative flex-1 md:w-80">
                  <Input
                    placeholder="名前やIDで検索"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-white"
                    aria-label="検索"
                  />
                </div>
                <RefreshButton />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {listError && (
              <ErrorState message={listError} onRetry={fetchCurrent} />
            )}

            {loadingList ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-white/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-28" />
                  </div>
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center text-gray-600 py-10">
                <div className="text-4xl mb-3">🕊️</div>
                現在チェックイン中のユーザーはいません
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-600 py-10">
                <div className="text-4xl mb-3">🔍</div>
                条件に一致するチェックイン中のユーザーがいません
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <Card key={r.id} className="border-indigo-100">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {r.guestName}
                        </p>
                        <p className="text-sm text-gray-600">
                          ID: {r.guestDisplayId}
                        </p>
                        <p className="text-xs text-gray-500">
                          入場 {formatTime(r.checkinAt)} ・ 滞在{" "}
                          {formatStayDuration(new Date(r.checkinAt))}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => openConfirm(r)}
                        disabled={loading}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {loading ? "処理中..." : "チェックアウト"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center mt-8">
          <Link
            href="/checkin"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            入場手続きへ
          </Link>
        </div>
      </div>

      {/* 確認ダイアログ */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>チェックアウトを確認</DialogTitle>
            <DialogDescription>
              選択したユーザーをチェックアウトします。よろしいですか？
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="rounded-md bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-800">
              <p className="font-medium">{selected.guestName}</p>
              <p className="text-indigo-700">ID: {selected.guestDisplayId}</p>
              <p className="text-indigo-700">
                入場 {formatTime(selected.checkinAt)} ・ 滞在{" "}
                {formatStayDuration(new Date(selected.checkinAt))}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCheckout}
              disabled={loading}
            >
              {loading ? "処理中..." : "チェックアウト"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
