import { Suspense } from "react";
import { AdminLayout } from "@/components/admin-layout";
import {
  DashboardHeader,
  HeroMetrics,
  CurrentGuestsGrid,
  RecentActivityFeed,
  DashboardStatsSkeleton,
  CurrentGuestsGridSkeleton,
} from "@/components/features/admin/dashboard-redesigned";
import { CheckinService } from "@/services/checkin.service";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server Components for data fetching with error handling
async function DashboardStatsSection() {
  try {
    const stats = await CheckinService.getTodayStats();
    return <HeroMetrics stats={stats} />;
  } catch (error) {
    console.error("Stats fetch error:", error);
    return (
      <div className="space-y-4">
        <div className="bg-error/5 border border-error/20 rounded-lg p-6 text-center">
          <h3 className="text-heading-sm text-error mb-2">
            統計データの読み込みに失敗しました
          </h3>
          <p className="text-body-sm text-muted-foreground">
            しばらく時間をおいて再度お試しください
          </p>
        </div>
      </div>
    );
  }
}

async function CurrentGuestsSection() {
  try {
    const guests = await CheckinService.getCurrentGuests();
    
    // Mock data for recent activities - in a real app this would come from the service
    const recentActivities = guests.slice(0, 3).map((guest, index) => ({
      id: `activity-${guest.id}`,
      type: Math.random() > 0.5 ? 'checkin' : 'checkout' as const,
      guestName: guest.guest?.name || "Unknown Guest",
      timestamp: new Date(Date.now() - index * 1000 * 60 * 15), // 15 minutes apart
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CurrentGuestsGrid 
            guests={guests}
            onCheckout={() => {
              // This would integrate with the checkout functionality
            }}
            onViewDetails={() => {
              // This would navigate to guest details
            }}
            onAddGuest={() => {
              // This would navigate to guest registration
            }}
            onExport={() => {
              // This would export current guests data
            }}
          />
        </div>
        <div>
          <RecentActivityFeed 
            activities={recentActivities}
            onViewAll={() => {
              // This would navigate to full activity log
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Current guests fetch error:", error);
    return (
      <div className="bg-error/5 border border-error/20 rounded-lg p-6 text-center">
        <h3 className="text-heading-sm text-error mb-2">
          滞在者データの読み込みに失敗しました
        </h3>
        <p className="text-body-sm text-muted-foreground">
          ネットワーク接続を確認してください
        </p>
      </div>
    );
  }
}

// Main Dashboard Page with enhanced UX
export default function AdminDashboardPageRedesigned() {
  const handleRefresh = () => {
    // This would trigger a refresh of all dashboard data
    window.location.reload();
  };

  return (
    <AdminLayout title="ダッシュボード">
      <div className="space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader 
          lastUpdated={new Date()}
          onRefresh={handleRefresh}
        />

        {/* Hero Metrics - Primary KPIs */}
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStatsSection />
        </Suspense>

        {/* Current Guests Grid + Activity Feed */}
        <Suspense fallback={<CurrentGuestsGridSkeleton />}>
          <CurrentGuestsSection />
        </Suspense>
      </div>
    </AdminLayout>
  );
}