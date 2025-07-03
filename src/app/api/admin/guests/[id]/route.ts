import { NextRequest, NextResponse } from "next/server";
import { prisma, isGuestCheckedIn } from "@/lib/db";
import { adminGuestUpdateSchema } from "@/lib/validations";
import { ApiResponse, GuestWithStatus } from "@/types/api";

// ゲスト詳細取得 GET /api/admin/guests/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: 認証チェックを追加

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

    // 最後の訪問日を取得
    const lastVisit = await prisma.checkinRecord.findFirst({
      where: { guestId: guest.id },
      orderBy: { checkinAt: "desc" },
    });

    // 総訪問回数を取得
    const totalVisits = await prisma.checkinRecord.count({
      where: { guestId: guest.id },
    });

    const guestWithStatus: GuestWithStatus = {
      ...guest,
      isCurrentlyCheckedIn: isCheckedIn,
      lastVisitAt: lastVisit?.checkinAt || null,
      totalVisits,
    };

    const response: ApiResponse<GuestWithStatus> = {
      success: true,
      data: guestWithStatus,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin guest detail error:", error);

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

// ゲスト更新 PUT /api/admin/guests/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: 認証チェックを追加

    const { id } = await params;
    const body = await request.json();

    // バリデーション
    const validatedData = adminGuestUpdateSchema.parse(body);

    // ゲストの存在確認
    const existingGuest = await prisma.guest.findUnique({
      where: { id },
    });

    if (!existingGuest) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "ゲストが見つかりません",
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // ゲストを更新
    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        name: validatedData.name,
        contact: validatedData.contact || null,
      },
    });

    const response: ApiResponse<GuestWithStatus> = {
      success: true,
      data: {
        ...updatedGuest,
        isCurrentlyCheckedIn: false, // 後で正確な値を設定
      },
      message: "ゲスト情報を更新しました",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin guest update error:", error);

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

// ゲスト削除 DELETE /api/admin/guests/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: 認証チェックを追加

    const { id } = await params;

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

    // 現在チェックイン中かチェック
    const isCheckedIn = await isGuestCheckedIn(id);
    if (isCheckedIn) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "CONFLICT",
          message: "現在チェックイン中のため削除できません",
        },
      };
      return NextResponse.json(response, { status: 409 });
    }

    // ゲストを削除（CASCADE設定により関連するチェックイン記録も削除される）
    await prisma.guest.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: "ゲストを削除しました",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin guest delete error:", error);

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
