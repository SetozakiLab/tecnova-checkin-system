import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, GuestData } from "@/types/api";

const updateGuestSchema = z.object({
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // パラメータを解決
    const { id } = await params;
    
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

    const body = await request.json();
    const validatedData = updateGuestSchema.parse(body);

    // ゲストの存在確認
    const existingGuest = await prisma.guest.findUnique({
      where: { id },
    });

    if (!existingGuest) {
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

    // 同名の他のゲストが存在するかチェック
    const duplicateGuest = await prisma.guest.findFirst({
      where: {
        name: validatedData.name,
        id: { not: id },
      },
    });

    if (duplicateGuest) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "同じ名前の他のゲストが既に存在します",
          },
        },
        { status: 409 }
      );
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        name: validatedData.name,
        contact: validatedData.contact || null,
      },
    });

    const responseData: GuestData = {
      id: updatedGuest.id,
      displayId: updatedGuest.displayId,
      name: updatedGuest.name,
      contact: updatedGuest.contact,
      createdAt: updatedGuest.createdAt.toISOString(),
      updatedAt: updatedGuest.updatedAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<GuestData>>({
      success: true,
      data: responseData,
      message: "ゲスト情報を更新しました",
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

    console.error("Update guest error:", error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // パラメータを解決
    const { id } = await params;
    
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

    // ゲストの存在確認
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        checkins: {
          where: { isActive: true },
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

    // 現在チェックイン中の場合は削除不可
    if (guest.checkins.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "現在チェックイン中のため削除できません",
          },
        },
        { status: 409 }
      );
    }

    await prisma.guest.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "ゲストを削除しました",
    });
  } catch (error) {
    console.error("Delete guest error:", error);
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
