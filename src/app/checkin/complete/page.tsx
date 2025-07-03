"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CheckinCompleteContent() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action"); // "checkin" or "checkout"
  const guestName = searchParams.get("guestName");
  const stayDuration = searchParams.get("stayDuration");

  const isCheckin = action === "checkin";

  // 3秒後に自動的にトップページに遷移
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isCheckin
          ? "bg-gradient-to-b from-green-50 to-emerald-100"
          : "bg-gradient-to-b from-orange-50 to-amber-100"
      }`}
    >
      <div className="max-w-md w-full space-y-6">
        {/* 成功アイコン */}
        <div className="text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              isCheckin ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            {isCheckin ? (
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isCheckin ? "ようこそ！" : "おつかれさま！"}
          </h1>

          <p className="text-lg text-gray-600">{guestName || "ゲスト"}さん</p>
        </div>

        {/* メッセージカード */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle
              className={`text-lg ${
                isCheckin ? "text-green-700" : "text-orange-700"
              }`}
            >
              {isCheckin ? "チェックイン完了" : "チェックアウト完了"}
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isCheckin ? (
              <div className="space-y-2">
                <p className="text-gray-600">tec-novaへようこそ！</p>
                <p className="text-sm text-gray-500">
                  楽しい時間をお過ごしください
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">今日もお疲れさまでした！</p>
                {stayDuration && (
                  <p className="text-sm text-gray-500">
                    滞在時間: {stayDuration}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  またのお越しをお待ちしています
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 自動遷移の案内 */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>3秒後に自動的にトップページに戻ります</p>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">今すぐ戻る</Link>
            </Button>
          </div>
        </div>

        {/* 装飾的な要素 */}
        <div className="text-center">
          {isCheckin ? (
            <div className="flex justify-center space-x-2 text-2xl">
              <span>🎉</span>
              <span>✨</span>
              <span>🚀</span>
            </div>
          ) : (
            <div className="flex justify-center space-x-2 text-2xl">
              <span>👋</span>
              <span>🌟</span>
              <span>💫</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckinCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      }
    >
      <CheckinCompleteContent />
    </Suspense>
  );
}
