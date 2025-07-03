import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiResponse, TodayStats } from "@/types/api";

// 今日の統計情報 GET /api/admin/dashboard/today-stats
export async function GET() {
  try {
    // TODO: 認証チェックを追加

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // 今日のチェックイン記録を取得
    const todayCheckins = await prisma.checkinRecord.findMany({
      where: {
        checkinAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
      include: {
        guest: true,
      },
    });

    // 現在の滞在者数
    const currentGuests = await prisma.checkinRecord.count({
      where: {
        isActive: true,
      },
    });

    // 今日の統計を計算
    const totalVisitors = todayCheckins.length;
    const totalCheckins = todayCheckins.length;
    const totalCheckouts = todayCheckins.filter(
      (record: { checkoutAt: Date | null }) => record.checkoutAt
    ).length;

    // 平均滞在時間を計算
    const completedStays = todayCheckins.filter(
      (record: { checkoutAt: Date | null }) => record.checkoutAt
    );
    let averageStayTime = "0分";

    if (completedStays.length > 0) {
      const totalMinutes = completedStays.reduce(
        (sum: number, record: { checkoutAt: Date | null; checkinAt: Date }) => {
          if (record.checkoutAt) {
            const duration =
              record.checkoutAt.getTime() - record.checkinAt.getTime();
            return sum + Math.floor(duration / (1000 * 60));
          }
          return sum;
        },
        0
      );

      const avgMinutes = Math.floor(totalMinutes / completedStays.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;

      if (hours > 0) {
        averageStayTime = `${hours}時間${minutes}分`;
      } else {
        averageStayTime = `${minutes}分`;
      }
    }

    // ピーク時間を計算（簡易版）
    const hourlyStats = new Map<number, number>();
    todayCheckins.forEach((record: { checkinAt: Date }) => {
      const hour = record.checkinAt.getHours();
      hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + 1);
    });

    let peakHour = 0;
    let peakCount = 0;
    hourlyStats.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    });

    const peakTime =
      peakCount > 0 ? `${peakHour}:00-${peakHour + 1}:00` : "データなし";

    const stats: TodayStats = {
      date: today.toISOString().split("T")[0],
      totalVisitors,
      currentGuests,
      totalCheckins,
      totalCheckouts,
      averageStayTime,
      peakTime,
      peakCount,
    };

    const response: ApiResponse<TodayStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Today stats error:", error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "サーバー内部エラーが発生しました",
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
