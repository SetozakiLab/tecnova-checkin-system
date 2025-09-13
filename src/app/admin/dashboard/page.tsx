import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin-layout";
import {
  DashboardStats,
  CurrentGuestsList,
  TodaySummary,
  StatsCardsSkeleton,
  CurrentGuestsSkeleton,
  TodaySummarySkeleton,
} from "@/components/features/admin/dashboard-components";
import { CheckinService } from "@/services/checkin.service";

// Import the refresh button from shared components
import { RefreshButton } from "@/components/shared";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server Components for data fetching with error handling
async function DashboardStatsSection() {
  try {
    // Force dynamic rendering by revalidating data
    const stats = await CheckinService.getTodayStats();
    return <DashboardStats stats={stats} />;
  } catch (error) {
    console.error("Stats fetch error:", error);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 text-sm">
              統計データの読み込みに失敗しました
            </p>
            <p className="text-xs text-red-500 mt-1">
              しばらく時間をおいて再度お試しください
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

async function CurrentGuestsSection() {
  try {
    // Force dynamic rendering
    const guests = await CheckinService.getCurrentGuests();
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">現在の滞在者</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              {guests.length}人が滞在中
            </div>
            <RefreshButton />
          </div>
        </CardHeader>
        <CardContent>
          <CurrentGuestsList guests={guests} />
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Current guests fetch error:", error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">現在の滞在者</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">
            滞在者データの読み込みに失敗しました
          </p>
          <RefreshButton />
        </CardContent>
      </Card>
    );
  }
}

async function TodaySummarySection() {
  try {
    // Force dynamic rendering
    const stats = await CheckinService.getTodayStats();
    return <TodaySummary stats={stats} />;
  } catch (error) {
    console.error("Today summary fetch error:", error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">
            今日の入退場サマリー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">
            サマリーデータの読み込みに失敗しました
          </p>
          <p className="text-xs text-red-500 mt-1">
            しばらく時間をおいて再度お試しください
          </p>
        </CardContent>
      </Card>
    );
  }
}

// Main Dashboard Page with Suspense boundaries
export default function AdminDashboardPage() {
  return (
    <AdminLayout title="ダッシュボード">
      <div className="space-y-6">
        {/* Statistics Cards - Loads first */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <DashboardStatsSection />
        </Suspense>

        {/* Current Guests - Independent loading */}
        <Suspense
          fallback={
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">現在の滞在者</CardTitle>
                <div className="text-sm text-slate-600">読み込み中...</div>
              </CardHeader>
              <CardContent>
                <CurrentGuestsSkeleton />
              </CardContent>
            </Card>
          }
        >
          <CurrentGuestsSection />
        </Suspense>

        {/* Today Summary - Loads independently */}
        <Suspense fallback={<TodaySummarySkeleton />}>
          <TodaySummarySection />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
