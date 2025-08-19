"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { ApiResponse, CheckinRecord, GuestData } from "@/types/api";
import { useCheckinActions } from "@/hooks/use-checkin-actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { loading, error, handleCheckout } = useCheckinActions();
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        setLoadingList(true);
        const res = await fetch("/api/checkins/current");
        const result: ApiResponse<CheckinRecord[]> = await res.json();
        if (!result.success) {
          setListError(result.error?.message || "一覧の取得に失敗しました");
          return;
        }
        setRecords(result.data || []);
      } catch (e) {
        setListError("サーバーエラーが発生しました");
      } finally {
        setLoadingList(false);
      }
    };
    fetchCurrent();
  }, []);

  const onCheckout = async (guestId: string) => {
    // CheckinRecord から必要な最小情報の GuestData を合成
    const record = records.find((r) => r.guestId === guestId);
    if (!record) return;
    const guest: GuestData = {
      id: record.guestId,
      displayId: record.guestDisplayId,
      name: record.guestName,
      createdAt: new Date().toISOString(),
      isCurrentlyCheckedIn: true,
    };
    await handleCheckout(guest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold text-amber-800">tec-nova</h1>
            <p className="text-lg text-amber-600">退場手続き</p>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            チェックイン中のユーザー
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>現在入場中の一覧</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {listError && <ErrorState message={listError} />}
            {loadingList ? (
              <div className="text-center text-gray-600">読み込み中...</div>
            ) : records.length === 0 ? (
              <div className="text-center text-gray-600">
                現在チェックイン中のユーザーはいません
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <Card key={r.id} className="border-amber-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{r.guestName}</p>
                        <p className="text-sm text-gray-600">
                          ID: {r.guestDisplayId}
                        </p>
                        <p className="text-xs text-gray-500">
                          入場時刻: {new Date(r.checkinAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => onCheckout(r.guestId)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
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
    </div>
  );
}
