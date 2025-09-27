"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  ArrowLeft,
  Home,
  LogOut,
  Search,
  Users,
  ClipboardCheck,
  DoorClosed,
} from "lucide-react";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";

export default function CheckoutPage() {
  const { loading, handleCheckout } = useCheckinActions();
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<CheckinRecord | null>(null);
  const { playClick, playSuccess } = useGuestSoundEffects();

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
    playClick();
    setSelected(record);
    setConfirmOpen(true);
  };

  const confirmCheckout = async () => {
    if (!selected) return;
    playClick();
    const guest: GuestData = {
      id: selected.guestId,
      displayId: selected.guestDisplayId,
      name: selected.guestName,
      createdAt: new Date().toISOString(),
      isCurrentlyCheckedIn: true,
    };
    try {
      const success = await handleCheckout(guest);
      if (success) {
        playSuccess();
      }
    } catch (error) {
      console.error("Checkout failed", error);
    }
    setConfirmOpen(false);
    setSelected(null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex-1 px-4 py-10 md:max-w-4xl md:px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex h-full flex-col gap-8"
        >
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" onClick={() => playClick()} className="block">
                  <h1 className="text-3xl font-semibold text-slate-900 flex items-center gap-2">
                    <DoorClosed className="h-8 w-8" aria-hidden />
                    チェックアウト
                  </h1>
                </Link>
                <p className="mt-3 text-sm text-slate-600">
                  現在チェックイン中のゲストを確認し、退場処理を行います。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:w-auto sm:flex-row">
                <Link href="/checkin" className="flex-1 sm:flex-none">
                  <Button
                    variant="secondary"
                    className="w-full min-w-[150px] justify-center gap-2 text-slate-700"
                    onClick={() => playClick()}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    チェックイン手続き
                  </Button>
                </Link>
                <Link href="/register" className="flex-1 sm:flex-none">
                  <Button
                    className="w-full min-w-[150px] justify-center gap-2 bg-slate-900 hover:bg-slate-800"
                    onClick={() => playClick()}
                  >
                    <Users className="h-4 w-4" aria-hidden />
                    新規登録
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      現在チェックイン中の一覧
                    </CardTitle>
                    {!loadingList && (
                      <Badge variant="outline" className="text-slate-600">
                        {filtered.length} 件
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm text-slate-500">
                    {loadingList
                      ? "読み込み中..."
                      : "退場を行うゲストを選択してください"}
                  </CardDescription>
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="名前やIDで検索"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                      aria-label="検索"
                    />
                  </div>
                  <RefreshButton />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-0 pb-6 pt-6 sm:px-6">
              {listError && (
                <ErrorState message={listError} onRetry={fetchCurrent} />
              )}

              {loadingList ? (
                <div className="space-y-3 px-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
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
                <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-slate-500">
                  <ClipboardCheck className="h-8 w-8" aria-hidden />
                  <p className="text-sm">
                    現在チェックイン中のゲストはいません。
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-slate-500">
                  <Search className="h-8 w-8" aria-hidden />
                  <p className="text-sm">
                    条件に一致するチェックイン中のゲストが見つかりませんでした。
                  </p>
                </div>
              ) : (
                <div className="space-y-3 px-6">
                  <AnimatePresence initial={false}>
                    {filtered.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Card className="border-slate-200">
                          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-slate-900">
                                {r.guestName}
                              </p>
                              <p className="text-sm text-slate-600">
                                ID: {r.guestDisplayId}
                              </p>
                              <p className="text-xs text-slate-500">
                                チェックイン {formatTime(r.checkinAt)} ・ 滞在{" "}
                                {formatStayDuration(new Date(r.checkinAt))}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 sm:w-auto"
                              onClick={() => openConfirm(r)}
                              disabled={loading}
                            >
                              <LogOut className="h-4 w-4" aria-hidden />
                              {loading ? "処理中..." : "チェックアウト"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Link href="/" onClick={() => playClick()}>
              <Button variant="ghost" className="gap-2 text-slate-600">
                <Home className="h-4 w-4" aria-hidden />
                ホームへ戻る
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              チェックアウトを確認
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              選択したゲストをチェックアウトします。よろしいですか？
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{selected.guestName}</p>
              <p className="text-slate-600">ID: {selected.guestDisplayId}</p>
              <p className="text-slate-500">
                チェックイン {formatTime(selected.checkinAt)} ・ 滞在{" "}
                {formatStayDuration(new Date(selected.checkinAt))}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                playClick();
                setConfirmOpen(false);
              }}
            >
              キャンセル
            </Button>
            <Button
              className="bg-slate-900 hover:bg-slate-800"
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
