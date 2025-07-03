import { NextRequest, NextResponse } from "next/server";
import { prisma, generateDisplayId } from "@/lib/db";
import { guestRegistrationSchema } from "@/lib/validations";
import { ApiResponse, Guest } from "@/types/api";

// ゲスト新規登録 POST /api/guests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const validatedData = guestRegistrationSchema.parse(body);

    // displayIdを生成
    const displayId = await generateDisplayId();

    // ゲストを作成
    const guest = await prisma.guest.create({
      data: {
        displayId,
        name: validatedData.name,
        contact: validatedData.contact || null,
      },
    });

    const response: ApiResponse<Guest> = {
      success: true,
      data: guest,
      message: "ゲストを登録しました",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Guest registration error:", error);

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
