"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
  DashboardStats,
  CurrentGuestsList,
  TodaySummary,
} from "@/components/features/admin/dashboard-components";

export default function AdminDashboardPage() {
  const { currentGuests, todayStats, loading, error, refetch } =
    useDashboardData();

  if (loading) {
    return (
      <AdminLayout title="ダッシュボード">
        <LoadingState message="データを読み込み中..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="ダッシュボード">
        <div className="text-center py-12">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ダッシュボード">
      <div className="space-y-6">
        {/* 統計カード */}
        {todayStats && <DashboardStats stats={todayStats} />}

        {/* 現在の滞在者 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">現在の滞在者</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                {currentGuests.length}人が滞在中
              </div>
              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                更新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CurrentGuestsList guests={currentGuests} />
          </CardContent>
        </Card>

        {/* 今日の入退場サマリー */}
        {todayStats && <TodaySummary stats={todayStats} />}
      </div>
    </AdminLayout>
  );
}
