import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse, GuestData } from "@/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // パラメータを解決
    const { id } = await params;
    
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

    const responseData: GuestData = {
      id: guest.id,
      displayId: guest.displayId,
      name: guest.name,
      contact: guest.contact,
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      currentCheckinId: guest.checkins[0]?.id || null,
      lastCheckinAt: guest.checkins[0]?.checkinAt.toISOString() || null,
      createdAt: guest.createdAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<GuestData>>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get guest error:", error);
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
