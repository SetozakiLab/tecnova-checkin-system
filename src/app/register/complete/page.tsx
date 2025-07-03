"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function RegisterCompleteContent() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get("id");
  const displayId = searchParams.get("displayId");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 成功アイコン */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">登録完了！</h1>
          <p className="text-gray-600">あなたのIDが発行されました</p>
        </div>

        {/* ID表示カード */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">あなたのID</CardTitle>
            <CardDescription>
              次回から入退場でこのIDを使用できます
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {displayId || "---"}
              </div>
              <p className="text-sm text-gray-600">
                このIDを覚えておいてください
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <p>QRコード機能は将来実装予定です</p>
              <p className="mt-1">ID: {guestId}</p>
            </div>
          </CardContent>
        </Card>

        {/* 説明カード */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">次回のご利用について</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>• 次回来場時は「メンバーの方」を選択してください</p>
              <p>• お名前またはIDで検索できます</p>
              <p>• チェックイン・チェックアウトをお忘れなく</p>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/">トップに戻る</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/checkin">チェックインする</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterCompletePage() {
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
      <RegisterCompleteContent />
    </Suspense>
  );
}
