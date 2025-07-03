"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiResponse, GuestWithStatus, CheckinRecordDetail } from "@/types/api";

export default function CheckinOperationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [guest, setGuest] = useState<GuestWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOperating, setIsOperating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string>("");

  // パラメータの初期化
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  // ゲスト情報を取得
  useEffect(() => {
    if (!id) return;

    const fetchGuest = async () => {
      try {
        const response = await fetch(`/api/guests/${id}`);
        const result: ApiResponse<GuestWithStatus> = await response.json();

        if (result.success && result.data) {
          setGuest(result.data);
        } else {
          setError(result.error?.message || "ゲスト情報の取得に失敗しました");
        }
      } catch (err) {
        console.error("Guest fetch error:", err);
        setError("通信エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuest();
  }, [id]);

  const handleCheckin = async () => {
    if (!guest) return;

    setIsOperating(true);
    setError(null);

    try {
      const response = await fetch(`/api/guests/${guest.id}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      const result: ApiResponse<CheckinRecordDetail> = await response.json();

      if (result.success) {
        // 操作完了画面に遷移
        router.push(
          `/checkin/complete?action=checkin&guestName=${encodeURIComponent(
            guest.name
          )}`
        );
      } else {
        setError(result.error?.message || "チェックインに失敗しました");
      }
    } catch (err) {
      console.error("Checkin error:", err);
      setError("通信エラーが発生しました");
    } finally {
      setIsOperating(false);
    }
  };

  const handleCheckout = async () => {
    if (!guest) return;

    setIsOperating(true);
    setError(null);

    try {
      const response = await fetch(`/api/guests/${guest.id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      const result: ApiResponse<
        CheckinRecordDetail & { stayDuration: string }
      > = await response.json();

      if (result.success) {
        // 操作完了画面に遷移
        router.push(
          `/checkin/complete?action=checkout&guestName=${encodeURIComponent(
            guest.name
          )}&stayDuration=${encodeURIComponent(
            result.data?.stayDuration || ""
          )}`
        );
      } else {
        setError(result.error?.message || "チェックアウトに失敗しました");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("通信エラーが発生しました");
    } finally {
      setIsOperating(false);
    }
  };

  const formatLastCheckin = (date: Date | null) => {
    if (!date) return "初回利用";

    const lastCheckin = new Date(date);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) {
      return "1時間以内";
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}日前`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">エラー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error || "ゲストが見つかりません"}</p>
            <Button asChild className="w-full">
              <Link href="/checkin">検索に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* ゲスト情報カード */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">{guest.name}</CardTitle>
            <CardDescription>ID: {guest.displayId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 現在の状態 */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium">現在の状態:</span>
                {guest.isCurrentlyCheckedIn ? (
                  <Badge className="bg-green-100 text-green-800">施設内</Badge>
                ) : (
                  <Badge variant="outline">施設外</Badge>
                )}
              </div>

              <p className="text-sm text-gray-500">
                最終利用: {formatLastCheckin(guest.lastCheckinAt || null)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* 操作ボタン */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {guest.isCurrentlyCheckedIn
                ? "チェックアウトしますか？"
                : "チェックインしますか？"}
            </CardTitle>
            <CardDescription className="text-center">
              {guest.isCurrentlyCheckedIn
                ? "退場手続きを行います"
                : "入場手続きを行います"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {guest.isCurrentlyCheckedIn ? (
              <Button
                onClick={handleCheckout}
                disabled={isOperating}
                className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
              >
                {isOperating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    チェックアウト中...
                  </>
                ) : (
                  "チェックアウト"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCheckin}
                disabled={isOperating}
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
              >
                {isOperating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    チェックイン中...
                  </>
                ) : (
                  "チェックイン"
                )}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full"
              asChild
              disabled={isOperating}
            >
              <Link href="/checkin">戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
