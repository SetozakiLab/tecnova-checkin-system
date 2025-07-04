import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateDisplayId } from "@/lib/date-utils";
import { ApiResponse, GuestData } from "@/types/api";

const createGuestSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(50, "名前は50文字以内で入力してください"),
  contact: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createGuestSchema.parse(body);

    // 同名のゲストが存在するかチェック
    const existingGuest = await prisma.guest.findFirst({
      where: { name: validatedData.name },
    });

    if (existingGuest) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "同じ名前のゲストが既に登録されています",
          },
        },
        { status: 409 }
      );
    }

    // ユニークなdisplayIdを生成
    let displayId: number;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      displayId = generateDisplayId();
      const existingDisplayId = await prisma.guest.findUnique({
        where: { displayId },
      });
      if (!existingDisplayId) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
              "IDの生成に失敗しました。しばらくしてから再度お試しください",
          },
        },
        { status: 500 }
      );
    }

    const guest = await prisma.guest.create({
      data: {
        displayId,
        name: validatedData.name,
        contact: validatedData.contact || null,
      },
    });

    const responseData: GuestData = {
      id: guest.id,
      displayId: guest.displayId,
      name: guest.name,
      contact: guest.contact,
      createdAt: guest.createdAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<GuestData>>({
      success: true,
      data: responseData,
      message: "ゲストを登録しました",
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

    console.error("Create guest error:", error);
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
