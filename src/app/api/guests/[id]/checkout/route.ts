import { NextRequest, NextResponse } from "next/server";
import { prisma, isGuestCheckedIn, calculateStayDuration } from "@/lib/db";
import { checkinSchema } from "@/lib/validations";
import { ApiResponse, CheckinRecordDetail } from "@/types/api";

// チェックアウト POST /api/guests/[id]/checkout
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // バリデーション
    const validatedData = checkinSchema.parse(body);

    // ゲストの存在確認
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

    // チェックイン済みかチェック
    const isCheckedIn = await isGuestCheckedIn(id);
    if (!isCheckedIn) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "NOT_CHECKED_IN",
          message: "チェックインしていません",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 現在のチェックイン記録を取得
    const currentCheckin = await prisma.checkinRecord.findFirst({
      where: {
        guestId: id,
        isActive: true,
      },
    });

    if (!currentCheckin) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "NOT_CHECKED_IN",
          message: "アクティブなチェックイン記録が見つかりません",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // チェックアウト時刻
    const checkoutAt = validatedData.timestamp
      ? new Date(validatedData.timestamp)
      : new Date();

    // チェックイン記録を更新
    const updatedCheckinRecord = await prisma.checkinRecord.update({
      where: { id: currentCheckin.id },
      data: {
        checkoutAt,
        isActive: false,
      },
    });

    // 滞在時間を計算
    const stayDuration = calculateStayDuration(
      updatedCheckinRecord.checkinAt,
      checkoutAt
    );

    const response: ApiResponse<
      CheckinRecordDetail & { stayDuration: string }
    > = {
      success: true,
      data: {
        ...updatedCheckinRecord,
        guest,
        stayDuration,
      },
      message: "チェックアウトしました",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "入力内容に誤りがあります",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

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
