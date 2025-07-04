import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse, GuestData } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "検索語を入力してください",
          },
        },
        { status: 400 }
      );
    }

    // 数字の場合はdisplayIdで検索、文字の場合は名前で検索
    const isNumeric = /^\d+$/.test(query);

    const guests = await prisma.guest.findMany({
      where: isNumeric
        ? {
            displayId: parseInt(query),
          }
        : {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const responseData: GuestData[] = guests.map((guest) => ({
      id: guest.id,
      displayId: guest.displayId,
      name: guest.name,
      contact: guest.contact,
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      lastCheckinAt: guest.checkins[0]?.checkinAt.toISOString() || null,
      createdAt: guest.createdAt.toISOString(),
    }));

    return NextResponse.json<ApiResponse<GuestData[]>>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Search guests error:", error);
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
