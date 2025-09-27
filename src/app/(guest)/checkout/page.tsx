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
import { LogOut, ArrowLeft, Search, Users, UserX } from "lucide-react";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { PageContainer } from "@/components/ui/page-container";
import { FadeIn, SlideInLeft, Stagger, StaggerItem, ScaleIn } from "@/components/ui/motion";

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
    <PageContainer gradient="orange">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <FadeIn delay={0.1} className="text-center mb-12">
          <Link
            href="/"
            className="inline-block mb-8 group transition-all duration-300 hover:scale-105"
            onClick={() => playClick()}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              tec-nova
            </h1>
            <p className="text-lg text-muted-foreground">入退場管理システム</p>
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
              <LogOut className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">退場手続き</h2>
          </div>
          <p className="text-muted-foreground">現在入場中の方からチェックアウトする方を選択してください</p>
        </FadeIn>

        <SlideInLeft delay={0.3}>
          <Card className="border-2 border-orange-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl md:text-2xl">現在入場中の一覧</CardTitle>
                    <CardDescription>
                      {loadingList ? "読み込み中..." : `${filtered.length} 件表示`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex w-full md:w-auto items-center gap-2">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="名前やIDで検索"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-white/90 backdrop-blur-sm border-primary/20 focus:border-primary/40"
                      aria-label="検索"
                    />
                  </div>
                  <RefreshButton />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {listError && (
                <ScaleIn delay={0.1}>
                  <ErrorState message={listError} onRetry={fetchCurrent} />
                </ScaleIn>
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
                <FadeIn delay={0.3} className="text-center text-muted-foreground py-16">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium mb-2">現在チェックイン中のユーザーはいません</p>
                  <p className="text-sm">全てのユーザーがチェックアウト済みです</p>
                </FadeIn>
              ) : filtered.length === 0 ? (
                <FadeIn delay={0.3} className="text-center text-muted-foreground py-16">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-lg font-medium mb-2">検索結果が見つかりません</p>
                  <p className="text-sm">条件に一致するチェックイン中のユーザーがいません</p>
                </FadeIn>
              ) : (
                <Stagger staggerDelay={0.05} className="space-y-3">
                  {filtered.map((r) => (
                    <StaggerItem key={r.id}>
                      <Card className="border-orange-200/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-orange-300/50 transition-all duration-300 hover:shadow-md">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-semibold text-sm">
                                {r.guestName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-base">
                                {r.guestName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ID: {r.guestDisplayId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                入場 {formatTime(r.checkinAt)} ・ 滞在{" "}
                                {formatStayDuration(new Date(r.checkinAt))}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => openConfirm(r)}
                            disabled={loading}
                            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            {loading ? "処理中..." : "チェックアウト"}
                          </Button>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </CardContent>
          </Card>
        </SlideInLeft>

        {/* Footer */}
        <FadeIn delay={0.6} className="text-center mt-12">
          <Link
            href="/checkin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            onClick={() => playClick()}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            入場手続きへ
          </Link>
        </FadeIn>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-orange-200/50 bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
                <LogOut className="h-5 w-5 text-orange-600" />
              </div>
              <DialogTitle className="text-xl">チェックアウトを確認</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              選択したユーザーをチェックアウトします。よろしいですか？
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="rounded-lg bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/50 p-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">
                    {selected.guestName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-orange-800 text-base">{selected.guestName}</p>
                  <p className="text-orange-700">ID: {selected.guestDisplayId}</p>
                  <p className="text-orange-700">
                    入場 {formatTime(selected.checkinAt)} ・ 滞在{" "}
                    {formatStayDuration(new Date(selected.checkinAt))}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                playClick();
                setConfirmOpen(false);
              }}
              className="border-primary/20 hover:bg-primary/5"
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCheckout}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? "処理中..." : "チェックアウト"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
