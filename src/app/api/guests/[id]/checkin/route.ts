import { NextRequest, NextResponse } from "next/server";
import { prisma, isGuestCheckedIn } from "@/lib/db";
import { checkinSchema } from "@/lib/validations";
import { ApiResponse, CheckinRecordDetail } from "@/types/api";

// チェックイン POST /api/guests/[id]/checkin
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

    // 既にチェックイン済みかチェック
    const isAlreadyCheckedIn = await isGuestCheckedIn(id);
    if (isAlreadyCheckedIn) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "ALREADY_CHECKED_IN",
          message: "既にチェックイン済みです",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // チェックイン記録を作成
    const checkinAt = validatedData.timestamp
      ? new Date(validatedData.timestamp)
      : new Date();

    const checkinRecord = await prisma.checkinRecord.create({
      data: {
        guestId: id,
        checkinAt,
        isActive: true,
      },
      include: {
        guest: true,
      },
    });

    const response: ApiResponse<CheckinRecordDetail> = {
      success: true,
      data: {
        ...checkinRecord,
        guest,
      },
      message: "チェックインしました",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Checkin error:", error);

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
