import { NextRequest, NextResponse } from "next/server";
import { prisma, calculateCurrentStayDuration } from "@/lib/db";
import { ApiResponse, CurrentGuest } from "@/types/api";

// 現在の滞在者一覧 GET /api/admin/dashboard/current-guests
export async function GET(_request: NextRequest) {
  try {
    // TODO: 認証チェックを追加

    // 現在チェックイン中のゲストを取得
    const activeCheckins = await prisma.checkinRecord.findMany({
      where: {
        isActive: true,
      },
      include: {
        guest: true,
      },
      orderBy: {
        checkinAt: "desc",
      },
    });

    // 滞在時間を計算して CurrentGuest 形式に変換
    const currentGuests: CurrentGuest[] = activeCheckins.map(
      (checkin: {
        guest: { id: string; displayId: number; name: string };
        checkinAt: Date;
      }) => ({
        id: checkin.guest.id,
        displayId: checkin.guest.displayId,
        name: checkin.guest.name,
        checkinAt: checkin.checkinAt,
        stayDuration: calculateCurrentStayDuration(checkin.checkinAt),
      })
    );

    const response: ApiResponse<{
      totalCount: number;
      guests: CurrentGuest[];
    }> = {
      success: true,
      data: {
        totalCount: currentGuests.length,
        guests: currentGuests,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Current guests error:", error);

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
