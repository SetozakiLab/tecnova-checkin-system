"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/date-utils";
import { ApiResponse, CheckinRecord } from "@/types/api";

interface TodayStats {
  totalCheckins: number;
  currentGuests: number;
  averageStayTime: number;
}

export default function AdminDashboardPage() {
  const [currentGuests, setCurrentGuests] = useState<CheckinRecord[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [guestsResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/dashboard/current-guests"),
        fetch("/api/admin/dashboard/today-stats"),
      ]);

      const guestsResult: ApiResponse<CheckinRecord[]> =
        await guestsResponse.json();
      const statsResult: ApiResponse<TodayStats> = await statsResponse.json();

      if (!guestsResult.success) {
        setError("現在の滞在者データの取得に失敗しました");
        return;
      }

      if (!statsResult.success) {
        setError("統計データの取得に失敗しました");
        return;
      }

      setCurrentGuests(guestsResult.data!);
      setTodayStats(statsResult.data!);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 5秒間隔で自動更新
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <AdminLayout title="ダッシュボード">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">データを読み込み中...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="ダッシュボード">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={fetchData}>再試行</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ダッシュボード">
      <div className="space-y-6">
        {/* 統計カード */}
        {todayStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  現在の滞在者数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {todayStats.currentGuests}
                </div>
                <p className="text-sm text-slate-600">人</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  今日のチェックイン数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {todayStats.totalCheckins}
                </div>
                <p className="text-sm text-slate-600">回</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  平均滞在時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {todayStats.averageStayTime}分
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 現在の滞在者一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">現在の滞在者一覧</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                {currentGuests.length}人滞在中
              </Badge>
              <Button size="sm" variant="outline" onClick={fetchData}>
                更新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentGuests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                現在滞在中のゲストはいません
              </div>
            ) : (
              <div className="space-y-3">
                {currentGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold text-lg">
                            {guest.guestName}
                          </p>
                          <p className="text-sm text-slate-600">
                            ID: {guest.guestDisplayId}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">入場時刻</p>
                      <p className="font-semibold">
                        {formatTime(guest.checkinAt)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        滞在時間: {guest.duration ? `${guest.duration}分` : "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 今日の入退場サマリー */}
        {todayStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">今日の入退場サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    チェックイン
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {todayStats.totalCheckins}
                  </p>
                  <p className="text-sm text-blue-600">回</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">滞在中</p>
                  <p className="text-2xl font-bold text-green-700">
                    {todayStats.currentGuests}
                  </p>
                  <p className="text-sm text-green-600">人</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">
                    平均滞在時間
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {todayStats.averageStayTime}
                  </p>
                  <p className="text-sm text-purple-600">分</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
