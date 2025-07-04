import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatStayDuration } from "@/lib/date-utils";
import { ApiResponse, CheckinRecordData } from "@/types/api";

const checkoutSchema = z.object({
  timestamp: z.string().datetime().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // パラメータを解決
    const { id } = await params;
    
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    // ゲストとアクティブなチェックイン記録を取得
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!guest) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "ゲストが見つかりません",
          },
        },
        { status: 404 }
      );
    }

    // チェックインしているかチェック
    if (guest.checkins.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "NOT_CHECKED_IN",
            message: "チェックインしていません",
          },
        },
        { status: 400 }
      );
    }

    const activeCheckin = guest.checkins[0];
    const checkoutTime = validatedData.timestamp
      ? new Date(validatedData.timestamp)
      : new Date();

    const updatedCheckinRecord = await prisma.checkinRecord.update({
      where: { id: activeCheckin.id },
      data: {
        checkoutAt: checkoutTime,
        isActive: false,
      },
    });

    const stayDuration = formatStayDuration(
      activeCheckin.checkinAt,
      checkoutTime
    );

    const responseData: CheckinRecordData = {
      id: updatedCheckinRecord.id,
      guestId: updatedCheckinRecord.guestId,
      guestName: guest.name,
      checkinAt: updatedCheckinRecord.checkinAt.toISOString(),
      checkoutAt: updatedCheckinRecord.checkoutAt!.toISOString(),
      stayDuration,
      isActive: updatedCheckinRecord.isActive,
    };

    return NextResponse.json<ApiResponse<CheckinRecordData>>({
      success: true,
      data: responseData,
      message: "チェックアウトしました",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "入力内容に誤りがあります",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    console.error("Checkout error:", error);
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
