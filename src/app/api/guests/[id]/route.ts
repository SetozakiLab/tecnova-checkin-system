import { NextRequest, NextResponse } from "next/server";
import { prisma, isGuestCheckedIn } from "@/lib/db";
import { ApiResponse, GuestWithStatus } from "@/types/api";

// ゲスト詳細取得 GET /api/guests/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ゲストを取得
    const guest = await prisma.guest.findUnique({
      where: { id },
    });

    if (!guest) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "ゲストが見つかりません",
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // チェックイン状態を取得
    const isCheckedIn = await isGuestCheckedIn(guest.id);

    // 現在のチェックイン記録を取得
    const currentCheckin = await prisma.checkinRecord.findFirst({
      where: {
        guestId: guest.id,
        isActive: true,
      },
    });

    // 最後のチェックイン記録を取得
    const lastCheckin = await prisma.checkinRecord.findFirst({
      where: { guestId: guest.id },
      orderBy: { checkinAt: "desc" },
    });

    const guestWithStatus: GuestWithStatus = {
      ...guest,
      isCurrentlyCheckedIn: isCheckedIn,
      currentCheckinId: currentCheckin?.id || null,
      lastCheckinAt: lastCheckin?.checkinAt || null,
    };

    const response: ApiResponse<GuestWithStatus> = {
      success: true,
      data: guestWithStatus,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Guest detail error:", error);

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
