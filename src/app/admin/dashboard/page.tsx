"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton, LoadingState } from "@/components/shared/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
  DashboardStats,
  CurrentGuestsList,
  TodaySummary,
} from "@/components/features/admin/dashboard-components";

export default function AdminDashboardPage() {
  const { currentGuests, todayStats, loading, isRefreshing, error, refetch } =
    useDashboardData();

  if (loading) {
    return (
      <AdminLayout title="ダッシュボード">
        <DashboardSkeleton />
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
        {todayStats && (
          <div className={isRefreshing ? "opacity-60 pointer-events-none" : ""}>
            <DashboardStats stats={todayStats} />
          </div>
        )}

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
                disabled={isRefreshing}
              >
                {isRefreshing ? "更新中..." : "更新"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isRefreshing ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <CurrentGuestsList guests={currentGuests} />
            )}
          </CardContent>
        </Card>

        {/* 今日の入退場サマリー */}
        {todayStats && (
          <div className={isRefreshing ? "opacity-60 pointer-events-none" : ""}>
            <TodaySummary stats={todayStats} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
