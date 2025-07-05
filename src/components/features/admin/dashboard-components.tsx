import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/date-utils";
import { useApi } from "@/hooks/use-api";
import { ErrorState } from "@/components/shared/error-state";
import { CheckinRecord } from "@/types/api";

interface TodayStats {
  totalCheckins: number;
  currentGuests: number;
  averageStayTime: number;
}

interface DashboardStatsProps {
  stats: TodayStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            現在の滞在者数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {stats.currentGuests}
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
            {stats.totalCheckins}
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
            {stats.averageStayTime}
          </div>
          <p className="text-sm text-slate-600">分</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface CurrentGuestsListProps {
  guests: CheckinRecord[];
}

export function CurrentGuestsList({ guests }: CurrentGuestsListProps) {
  if (guests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        現在滞在中のゲストはいません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {guests.map((guest) => (
        <div
          key={guest.id}
          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-semibold text-lg">{guest.guestName}</p>
                <p className="text-sm text-slate-600">
                  ID: {guest.guestDisplayId}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">入場時刻</p>
            <p className="font-semibold">{formatTime(guest.checkinAt)}</p>
            <p className="text-sm text-slate-600 mt-1">
              滞在時間: {guest.duration ? `${guest.duration}分` : "-"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TodaySummaryProps {
  stats: TodayStats;
}

export function TodaySummary({ stats }: TodaySummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">今日の入退場サマリー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">チェックイン</p>
            <p className="text-2xl font-bold text-blue-700">
              {stats.totalCheckins}
            </p>
            <p className="text-sm text-blue-600">回</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">滞在中</p>
            <p className="text-2xl font-bold text-green-700">
              {stats.currentGuests}
            </p>
            <p className="text-sm text-green-600">人</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">平均滞在時間</p>
            <p className="text-2xl font-bold text-purple-700">
              {stats.averageStayTime}
            </p>
            <p className="text-sm text-purple-600">分</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
