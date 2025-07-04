import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatStayDuration } from "@/lib/date-utils";
import { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "認証が必要です",
          },
        },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 今日のチェックイン記録を取得
    const todayRecords = await prisma.checkinRecord.findMany({
      where: {
        checkinAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        guest: true,
      },
    });

    // 現在滞在中のゲスト
    const currentGuests = await prisma.checkinRecord.count({
      where: { isActive: true },
    });

    // 統計計算
    const totalCheckins = todayRecords.length;
    const totalCheckouts = todayRecords.filter((r) => r.checkoutAt).length;
    const completedStays = todayRecords.filter((r) => r.checkoutAt);

    // 平均滞在時間の計算
    let averageStayTime = "0分";
    if (completedStays.length > 0) {
      const totalMinutes = completedStays.reduce((sum, record) => {
        if (record.checkoutAt) {
          const duration =
            record.checkoutAt.getTime() - record.checkinAt.getTime();
          return sum + Math.floor(duration / (1000 * 60));
        }
        return sum;
      }, 0);

      const avgMinutes = Math.floor(totalMinutes / completedStays.length);
      averageStayTime = formatStayDuration(
        new Date(0),
        new Date(avgMinutes * 60 * 1000)
      );
    }

    // ピーク時間の計算（簡易版）
    const hourCounts: Record<number, number> = {};
    todayRecords.forEach((record) => {
      const hour = record.checkinAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let peakHour = 0;
    let peakCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > peakCount) {
        peakHour = parseInt(hour);
        peakCount = count;
      }
    });

    const responseData = {
      date: today.toISOString().split("T")[0],
      totalVisitors: new Set(todayRecords.map((r) => r.guestId)).size,
      currentGuests,
      totalCheckins,
      totalCheckouts,
      averageStayTime,
      peakTime: peakCount > 0 ? `${peakHour}:00-${peakHour + 1}:00` : "-",
      peakCount,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get today stats error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバー内部エラーが発生しました",
        },
      },
      { status: 500 }
    );
  }
}
