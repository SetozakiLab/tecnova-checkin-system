// New Dashboard Page - Clean Architecture + Enhanced Design
// 情報設計に基づくダッシュボード画面 - クリーンアーキテクチャ + 強化されたデザイン

import {
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { Suspense } from "react";
import { AdminLayout } from "@/components/admin-layout";
import {
  CurrentGuestsList,
  CurrentGuestsSkeleton,
  DashboardStats,
  StatsCardsSkeleton,
  TodaySummary,
  TodaySummarySkeleton,
} from "@/components/features/admin/dashboard-components";
import { RefreshButton } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getServerCurrentGuests,
  getServerTodayStats,
} from "@/infrastructure/server-data";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server Components for data fetching with error handling
async function DashboardStatsSection() {
  try {
    const stats = await getServerTodayStats();
    return <DashboardStats stats={stats} />;
  } catch (error) {
    console.error("Stats fetch error:", error);
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          統計データの読み込みに失敗しました。しばらく時間をおいて再度お試しください。
        </AlertDescription>
      </Alert>
    );
  }
}

async function CurrentGuestsSection() {
  try {
    const guests = await getServerCurrentGuests();

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              現在の滞在者
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              リアルタイムで滞在者を確認できます
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-success">
                {guests.length}
              </div>
              <div className="text-xs text-muted-foreground">人が滞在中</div>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            現在の滞在者
          </CardTitle>
          <RefreshButton />
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              滞在者データの読み込みに失敗しました
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
}

async function TodaySummarySection() {
  try {
    const stats = await getServerTodayStats();
    return <TodaySummary stats={stats} />;
  } catch (error) {
    console.error("Today summary fetch error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5" />
            今日の入退場サマリー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              サマリーデータの読み込みに失敗しました。しばらく時間をおいて再度お試しください。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
}

// Quick Actions Card - 管理者の頻繁な操作へのショートカット
function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          クイックアクション
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">ゲスト管理</span>
            </div>
            <p className="text-xs text-muted-foreground">
              ゲスト情報の確認・編集
            </p>
          </button>

          <button
            type="button"
            className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">履歴確認</span>
            </div>
            <p className="text-xs text-muted-foreground">
              チェックイン履歴の確認
            </p>
          </button>

          <button
            type="button"
            className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">時間管理</span>
            </div>
            <p className="text-xs text-muted-foreground">滞在時間の分析</p>
          </button>

          <button
            type="button"
            className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">レポート</span>
            </div>
            <p className="text-xs text-muted-foreground">利用状況レポート</p>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Page with enhanced information architecture
export default function AdminDashboardPage() {
  return (
    <AdminLayout title="ダッシュボード">
      <div className="space-y-8">
        {/* Welcome Section */}

        {/* Key Metrics - 最も重要な情報を最上位に配置 */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            重要指標
          </h2>
          <Suspense fallback={<StatsCardsSkeleton />}>
            <DashboardStatsSection />
          </Suspense>
        </section>

        {/* Two Column Layout for Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Guests - Primary Information */}
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      現在の滞在者
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      読み込み中...
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CurrentGuestsSkeleton />
                  </CardContent>
                </Card>
              }
            >
              <CurrentGuestsSection />
            </Suspense>
          </div>

          {/* Quick Actions - Secondary Information */}
          <div className="space-y-6">
            <QuickActionsCard />

            {/* System Status Indicator */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">システム状態</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    データベース
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-xs text-success">正常</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    リアルタイム更新
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-xs text-success">有効</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    最終更新
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString("ja-JP")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today Summary - Supporting Information */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            本日のサマリー
          </h2>
          <Suspense fallback={<TodaySummarySkeleton />}>
            <TodaySummarySection />
          </Suspense>
        </section>
      </div>
    </AdminLayout>
  );
}
