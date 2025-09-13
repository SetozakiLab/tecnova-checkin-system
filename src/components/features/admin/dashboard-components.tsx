// Updated Dashboard Components using Clean Architecture and Design System
// 新しいデザインシステムを使用したダッシュボードコンポーネント

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard, UserAvatarWithStatus } from "@/components/common";
import { formatTime } from "@/lib/date-utils";
import { CheckinRecordWithGuest } from "@/domain/entities/checkin-record";
import { TodayStats } from "@/domain/repositories/checkin-record-repository";
import { CheckinRecordDomainService } from "@/domain/entities/checkin-record";
import { Users, Clock, Activity, TrendingUp } from "lucide-react";
import { formatGradeDisplay } from "@/domain/value-objects/grade";
import Link from "next/link";

// Loading components for Suspense fallbacks
export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

export function CurrentGuestsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border"
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodaySummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center p-4 bg-muted/30 rounded-lg">
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Updated Dashboard Stats using new design system
interface DashboardStatsProps {
  stats: TodayStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Guests - Most important metric */}
      <MetricCard
        title="現在の滞在者数"
        value={stats.currentGuests}
        subtitle="人が滞在中"
        icon={Users}
        variant="success"
      />

      {/* Today's Checkins */}
      <MetricCard
        title="今日のチェックイン数"
        value={stats.totalCheckins}
        subtitle="回"
        icon={Activity}
        variant="info"
      />

      {/* Average Stay Time */}
      <MetricCard
        title="平均滞在時間"
        value={CheckinRecordDomainService.formatStayDuration(
          stats.averageStayTime
        )}
        icon={Clock}
        variant="default"
      />

      {/* 混雑状況 */}
      <MetricCard
        title="混雑状況"
        value={
          stats.currentGuests >= 10
            ? "混雑"
            : stats.currentGuests >= 5
            ? "やや混雑"
            : "空いている"
        }
        subtitle={stats.currentGuests > 0 ? "滞在中" : "待機中"}
        icon={TrendingUp}
        variant={
          stats.currentGuests >= 10
            ? "success"
            : stats.currentGuests >= 5
            ? "warning"
            : "default"
        }
      />
    </div>
  );
}

// Updated Current Guests List using new design system
interface CurrentGuestsListProps {
  guests: CheckinRecordWithGuest[];
}

export function CurrentGuestsList({ guests }: CurrentGuestsListProps) {
  if (guests.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          現在滞在中のゲストはいません
        </h3>
        <p className="text-sm text-muted-foreground">
          新しいゲストがチェックインすると、ここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {guests.map((guest) => {
        const stayDuration = CheckinRecordDomainService.getCurrentStayDuration({
          id: guest.id,
          guestId: guest.guestId,
          checkinAt: guest.checkinAt,
          checkoutAt: guest.checkoutAt,
          isActive: guest.isActive,
        });

        return (
          <div
            key={guest.id}
            className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border/50 hover:bg-accent/70 transition-colors"
          >
            <Link
              href={`/admin/guests/${guest.guestId}`}
              className="flex-1 flex items-center gap-4 group"
            >
              <UserAvatarWithStatus
                name={guest.guestName}
                displayId={guest.guestDisplayId}
                isActive={guest.isActive}
                showStatus={false}
                className="flex-shrink"
              />
              <div className="space-y-1 text-xs text-muted-foreground">
                {guest.guestGrade && (
                  <div>
                    <span className="font-medium text-foreground">学年: </span>
                    {formatGradeDisplay(guest.guestGrade)}
                  </div>
                )}
                <div>
                  <span className="font-medium text-foreground">
                    訪問回数:{" "}
                  </span>
                  {guest.totalVisitCount ?? "-"} 回
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    累計滞在:{" "}
                  </span>
                  {guest.totalStayMinutes != null
                    ? CheckinRecordDomainService.formatStayDuration(
                        guest.totalStayMinutes
                      )
                    : "-"}
                </div>
              </div>
            </Link>

            <div className="text-right space-y-1">
              <div className="text-sm font-medium text-foreground">
                {formatTime(guest.checkinAt)}
              </div>
              <div className="text-xs text-muted-foreground">
                現在滞在:{" "}
                {CheckinRecordDomainService.formatStayDuration(stayDuration)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Updated Today Summary using new design system
interface TodaySummaryProps {
  stats: TodayStats;
}

export function TodaySummary({ stats }: TodaySummaryProps) {
  const summaryItems = [
    {
      label: "総チェックイン数",
      value: stats.totalCheckins,
      unit: "回",
      description: "今日の累計来場者数",
    },
    {
      label: "現在の滞在者",
      value: stats.currentGuests,
      unit: "人",
      description: "現在施設内にいる人数",
    },
    {
      label: "平均滞在時間",
      value: CheckinRecordDomainService.formatStayDuration(
        stats.averageStayTime
      ),
      unit: "",
      description: "平均的な利用時間",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="h-5 w-5" />
          今日の入退場サマリー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryItems.map((item, index) => (
            <div
              key={index}
              className="text-center p-6 bg-muted/30 rounded-lg border"
            >
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <div className="text-3xl font-bold text-foreground">
                  {item.value}
                  {item.unit && (
                    <span className="text-base text-muted-foreground ml-1">
                      {item.unit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
