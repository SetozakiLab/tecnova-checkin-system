"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiResponse, GuestData } from "@/types/api";

export default function CheckinCompletePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // 'checkin' or 'checkout'
  const guestId = searchParams.get("guestId");
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">よみこみ ちゅう...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-700">エラー</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline">ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCheckin = type === "checkin";

  return (
    <div
      className={`min-h-screen ${
        isCheckin
          ? "bg-gradient-to-br from-green-50 to-emerald-100"
          : "bg-gradient-to-br from-orange-50 to-yellow-100"
      } flex items-center justify-center p-4`}
    >
      <div className="max-w-2xl w-full">
        {/* 成功メッセージ */}
        <div className="text-center mb-8">
          <div
            className={`w-24 h-24 ${
              isCheckin ? "bg-green-500" : "bg-orange-500"
            } rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <span className="text-4xl text-white">
              {isCheckin ? "🏠" : "👋"}
            </span>
          </div>
          <h1
            className={`text-5xl font-bold mb-4 ${
              isCheckin ? "text-green-800" : "text-orange-800"
            }`}
          >
            {isCheckin ? "ようこそ！" : "また きてね！"}
          </h1>
          <p
            className={`text-2xl ${
              isCheckin ? "text-green-700" : "text-orange-700"
            }`}
          >
            {guest.name} さん
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              {isCheckin ? (
                <>
                  <p className="text-xl text-green-800 font-semibold">
                    チェックイン かんりょう！
                  </p>
                  <p className="text-lg text-gray-700">
                    きょうも たのしく すごしてね！
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-green-800">
                      なにか こまったことが あったら、
                      <br />
                      すぐに メンター に そうだん してね
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl text-orange-800 font-semibold">
                    チェックアウト かんりょう！
                  </p>
                  <p className="text-lg text-gray-700">
                    きょうは ありがとう！また あそびに きてね！
                  </p>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-orange-800">
                      きをつけて かえってね。
                      <br />
                      また まってるよ！
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 次回へのメッセージ */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">つぎ から は かんたん！</h3>
              <div className="text-left space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <p>
                    あなたの ばんごう <strong>{guest.displayId}</strong> を
                    おぼえておいてね
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <p>
                    つぎ から は ばんごう を にゅうりょく するだけ で
                    だいじょうぶ
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ナビゲーション */}
        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              ホームに もどる
            </Button>
          </Link>
          {isCheckin && (
            <Link href="/checkin" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                チェックアウト する ばあい
              </Button>
            </Link>
          )}
        </div>

        {/* 自動的に戻る */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            10びょう ご に じどうてき に ホーム に もどります
          </p>
        </div>
      </div>
    </div>
  );
}

// 10秒後に自動でホームに戻る
setTimeout(() => {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}, 10000);
