"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiResponse, GuestData } from "@/types/api";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Home,
  LogOut,
  ArrowLeft,
  UserCircle2,
  CheckCircle2Icon,
} from "lucide-react";

function CheckinCompleteContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // 'checkin' or 'checkout'
  const guestId = searchParams.get("guestId");
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successSoundPlayed, setSuccessSoundPlayed] = useState(false);
  const { playClick, playSuccess } = useGuestSoundEffects();

  useEffect(() => {
    const fetchGuest = async () => {
      if (!guestId) {
        setError("ゲスト情報が見つかりません");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/guests/${guestId}`);
        const result: ApiResponse<GuestData> = await response.json();

        if (!result.success) {
          setError("ゲスト情報の取得に失敗しました");
          return;
        }

        setGuest(result.data!);
      } catch (err) {
        console.error("Fetch guest error:", err);
        setError("サーバーエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [guestId]);

  useEffect(() => {
    if (!loading && guest && !error && !successSoundPlayed) {
      playSuccess();
      setSuccessSoundPlayed(true);
    }
  }, [guest, loading, error, successSoundPlayed, playSuccess]);

  // 30秒後に自動でホームに戻る
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center px-4 py-20">
          <div className="flex flex-col items-center gap-4 text-slate-600">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            <p className="text-sm">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex-1 px-4 py-10 md:max-w-md md:px-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold text-slate-900">
                エラーが発生しました
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {error || "ゲスト情報の取得に失敗しました"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="gap-2 text-slate-600"
                  onClick={() => playClick()}
                >
                  <Home className="h-4 w-4" aria-hidden />
                  ホームに戻る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCheckin = type === "checkin";

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex-1 px-4 py-10 md:max-w-3xl md:px-6">
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
                    <CheckCircle2Icon className="h-8 w-8" aria-hidden />
                    {isCheckin ? "チェックイン完了" : "チェックアウト完了"}
                  </h1>
                </Link>
                <p className="mt-3 text-sm text-slate-600">
                  {isCheckin
                    ? "本日のご来場、ありがとうございます。"
                    : "本日のご利用、ありがとうございました。"}
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
                    入退場画面へ
                  </Button>
                </Link>
                <Link href="/" className="flex-1 sm:flex-none">
                  <Button
                    variant="ghost"
                    className="w-full min-w-[150px] justify-center gap-2 text-slate-600"
                    onClick={() => playClick()}
                  >
                    <Home className="h-4 w-4" aria-hidden />
                    ホームへ戻る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="flex flex-col gap-6 px-6 py-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50"
                  >
                    {isCheckin ? (
                      <CheckCircle2
                        className="h-9 w-9 text-emerald-600"
                        aria-hidden
                      />
                    ) : (
                      <LogOut
                        className="h-9 w-9 text-emerald-600"
                        aria-hidden
                      />
                    )}
                  </motion.span>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {guest.name} さん
                    </h2>
                    <p className="text-sm text-slate-600">
                      {isCheckin
                        ? "チェックインの手続きが完了しました。"
                        : "チェックアウトの手続きが完了しました。"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      あなたのID
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {guest.displayId}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      ステータス
                    </p>
                    <p className="mt-2 text-base font-medium text-slate-800">
                      {isCheckin ? "滞在中" : "退場済み"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-600">
                    {isCheckin
                      ? "施設内ではメンターの指示に従い、安全にお過ごしください。"
                      : "お気をつけてお帰りください。またのご利用をお待ちしています。"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 px-6 py-8">
              <div className="flex items-center gap-3 text-slate-900">
                <UserCircle2 className="h-5 w-5" aria-hidden />
                <h3 className="text-base font-semibold">
                  次回の利用をスムーズに
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1 text-slate-600">
                    1
                  </Badge>
                  <p className="text-sm text-slate-600">
                    あなたのID{" "}
                    <span className="font-medium text-slate-900">
                      {guest.displayId}
                    </span>{" "}
                    を覚えておくと、次回の入退場がスムーズです。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1 text-slate-600">
                    2
                  </Badge>
                  <p className="text-sm text-slate-600">
                    次回からはIDを入力するだけで手続きを完了できます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => playClick()}
              >
                ホームに戻る
              </Button>
            </Link>
            {isCheckin && (
              <Link href="/checkout" className="flex-1">
                <Button
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  onClick={() => playClick()}
                >
                  チェックアウトを行う
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" aria-hidden />
            30秒後に自動的にホームへ遷移します
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="text-sm">読み込み中...</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckinCompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckinCompleteContent />
    </Suspense>
  );
}
