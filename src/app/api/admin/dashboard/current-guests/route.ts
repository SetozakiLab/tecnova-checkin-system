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

    const currentGuests = await prisma.checkinRecord.findMany({
      where: { isActive: true },
      include: {
        guest: true,
      },
      orderBy: { checkinAt: "asc" },
    });

    const guestsData = currentGuests.map((record) => ({
      id: record.guest.id,
      displayId: record.guest.displayId,
      name: record.guest.name,
      checkinAt: record.checkinAt.toISOString(),
      stayDuration: formatStayDuration(record.checkinAt),
    }));

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totalCount: currentGuests.length,
        guests: guestsData,
      },
    });
  } catch (error) {
    console.error("Get current guests error:", error);
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
