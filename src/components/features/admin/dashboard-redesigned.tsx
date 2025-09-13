import * as React from "react";
import { StatCard } from "@/components/common/enhanced-card";
import { LoadingButton, IconButton } from "@/components/common/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Activity,
  UserPlus,
  Download,
  RefreshCw,
  Eye,
  LogOut,
  AlertCircle
} from "lucide-react";
import { formatTime, formatStayDuration } from "@/lib/date-utils";
import { CheckinRecord } from "@/types/api";
import { cn, statusColors } from "@/lib/design-system";

interface TodayStats {
  totalCheckins: number;
  currentGuests: number;
  averageStayTime: number;
}

interface RecentActivity {
  id: string;
  type: 'checkin' | 'checkout';
  guestName: string;
  timestamp: Date;
}

// Header component for dashboard overview
interface DashboardHeaderProps {
  lastUpdated?: Date;
  onRefresh?: () => void;
  loading?: boolean;
}

export function DashboardHeader({ lastUpdated, onRefresh, loading }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-display-md text-foreground">ダッシュボード</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('ja-JP', { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <div className="text-caption text-muted-foreground">
            最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
          </div>
        )}
        <IconButton
          icon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />}
          onClick={onRefresh}
          loading={loading}
          variant="outline"
          size="sm"
          label="更新"
          showLabel
        />
      </div>
    </div>
  );
}

// Enhanced hero metrics using StatCard
interface HeroMetricsProps {
  stats: TodayStats;
  loading?: boolean;
  className?: string;
}

export function HeroMetrics({ stats, loading = false, className }: HeroMetricsProps) {
  const getGuestCountStatus = (count: number) => {
    if (count === 0) return "info";
    if (count > 20) return "warning";
    return "success";
  };

  const guestCountStatus = getGuestCountStatus(stats.currentGuests);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      <StatCard
        title="現在の滞在者数"
        value={stats.currentGuests}
        description={stats.currentGuests === 0 ? "誰もいません" : `${stats.currentGuests}人が在館中`}
        icon={<Users className={cn("h-5 w-5", statusColors[guestCountStatus].text)} />}
        loading={loading}
        className={cn(
          "transition-all duration-200",
          guestCountStatus === "warning" && "ring-2 ring-warning/20"
        )}
      />

      <StatCard
        title="今日のチェックイン数"
        value={stats.totalCheckins}
        description="回の入場"
        icon={<TrendingUp className="h-5 w-5 text-info" />}
        trend={{
          value: 12, // This would come from data comparison
          label: "前日比",
          isPositive: true
        }}
        loading={loading}
      />

      <StatCard
        title="平均滞在時間"
        value={`${stats.averageStayTime}分`}
        description="今日の平均"
        icon={<Clock className="h-5 w-5 text-success" />}
        loading={loading}
      />
    </div>
  );
}

// Guest card component for current guests grid
interface GuestCardProps {
  guest: CheckinRecord;
  onCheckout?: (guest: CheckinRecord) => void;
  onViewDetails?: (guest: CheckinRecord) => void;
  loading?: boolean;
}

export function GuestCard({ guest, onCheckout, onViewDetails, loading }: GuestCardProps) {
  const stayDuration = formatStayDuration(guest.checkinTime);
  const checkinTime = formatTime(guest.checkinTime);

  return (
    <Card className="group hover:card-elevated transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <div className="bg-primary/10 text-primary flex items-center justify-center h-full text-sm font-semibold">
              {guest.guest?.name?.charAt(0) || "G"}
            </div>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-heading-sm truncate">{guest.guest?.name || "Unknown"}</h3>
            <p className="text-caption text-muted-foreground">ID: {guest.guest?.displayId}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-body-sm">
            <span className="text-muted-foreground">入場時刻</span>
            <span>{checkinTime}</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-muted-foreground">滞在時間</span>
            <Badge variant="secondary" className="text-xs">
              {stayDuration}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onViewDetails && (
            <IconButton
              icon={<Eye className="h-3 w-3" />}
              onClick={() => onViewDetails(guest)}
              variant="outline"
              size="sm"
            />
          )}
          {onCheckout && (
            <LoadingButton
              onClick={() => onCheckout(guest)}
              variant="outline"
              size="sm"
              className="flex-1"
              loading={loading}
            >
              <LogOut className="h-3 w-3 mr-1" />
              チェックアウト
            </LoadingButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Current guests grid with enhanced UX
interface CurrentGuestsGridProps {
  guests: CheckinRecord[];
  onCheckout?: (guest: CheckinRecord) => void;
  onViewDetails?: (guest: CheckinRecord) => void;
  onAddGuest?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

export function CurrentGuestsGrid({ 
  guests, 
  onCheckout, 
  onViewDetails, 
  onAddGuest, 
  onExport,
  loading 
}: CurrentGuestsGridProps) {
  if (loading) {
    return <CurrentGuestsGridSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-heading-lg">現在の滞在者</h2>
          <Badge variant="outline" className="text-body-sm">
            {guests.length}人が在館中
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <IconButton
              icon={<Download className="h-4 w-4" />}
              onClick={onExport}
              variant="outline"
              size="sm"
              label="エクスポート"
            />
          )}
        </div>
      </div>

      {guests.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-heading-sm mb-2">現在滞在中の方はいません</h3>
            <p className="text-body-sm text-muted-foreground mb-4">
              新しいゲストがチェックインするとここに表示されます
            </p>
            {onAddGuest && (
              <LoadingButton onClick={onAddGuest} variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                ゲストを登録
              </LoadingButton>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {guests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onCheckout={onCheckout}
              onViewDetails={onViewDetails}
              loading={loading}
            />
          ))}
          {onAddGuest && (
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-center min-h-[140px]">
                <LoadingButton
                  onClick={onAddGuest}
                  variant="ghost"
                  className="h-full w-full flex-col gap-2"
                >
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-body-sm text-muted-foreground">ゲストを追加</span>
                </LoadingButton>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Recent activity feed
interface RecentActivityFeedProps {
  activities: RecentActivity[];
  loading?: boolean;
  onViewAll?: () => void;
}

export function RecentActivityFeed({ activities, loading, onViewAll }: RecentActivityFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            最近のアクティビティ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          最近のアクティビティ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>まだアクティビティがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  activity.type === 'checkin' ? "bg-success/10" : "bg-warning/10"
                )}>
                  {activity.type === 'checkin' ? (
                    <TrendingUp className={cn("h-4 w-4", statusColors.success.text)} />
                  ) : (
                    <LogOut className={cn("h-4 w-4", statusColors.warning.text)} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm">
                    <span className="font-medium">{activity.guestName}</span>
                    {activity.type === 'checkin' ? ' がチェックインしました' : ' がチェックアウトしました'}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}
            {onViewAll && activities.length > 5 && (
              <div className="text-center pt-3 border-t">
                <LoadingButton 
                  onClick={onViewAll}
                  variant="ghost"
                  size="sm"
                >
                  すべて表示
                </LoadingButton>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Loading skeletons
export function CurrentGuestsGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-16 mb-1" />
            <Skeleton className="h-4 w-8" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}