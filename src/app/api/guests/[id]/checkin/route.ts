import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiResponse, CheckinRecordData } from "@/types/api";

const checkinSchema = z.object({
  timestamp: z.string().datetime().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = checkinSchema.parse(body);

    // ゲストの存在確認
    const guest = await prisma.guest.findUnique({
      where: { id: params.id },
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

    // 既にチェックイン済みかチェック
    if (guest.checkins.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "ALREADY_CHECKED_IN",
            message: "既にチェックインしています",
          },
        },
        { status: 400 }
      );
    }

    const checkinTime = validatedData.timestamp
      ? new Date(validatedData.timestamp)
      : new Date();

    const checkinRecord = await prisma.checkinRecord.create({
      data: {
        guestId: params.id,
        checkinAt: checkinTime,
        isActive: true,
      },
    });

    const responseData: CheckinRecordData = {
      id: checkinRecord.id,
      guestId: checkinRecord.guestId,
      guestName: guest.name,
      checkinAt: checkinRecord.checkinAt.toISOString(),
      isActive: checkinRecord.isActive,
    };

    return NextResponse.json<ApiResponse<CheckinRecordData>>({
      success: true,
      data: responseData,
      message: "チェックインしました",
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

    console.error("Checkin error:", error);
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
