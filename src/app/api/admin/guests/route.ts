import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, GuestData, PaginationData } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // 検索条件の構築
    const whereConditions: any = {};

    if (search) {
      const isNumeric = /^\d+$/.test(search);
      if (isNumeric) {
        whereConditions.displayId = parseInt(search);
      } else {
        whereConditions.name = {
          contains: search,
          mode: "insensitive",
        };
      }
    }

    // 総件数取得
    const totalCount = await prisma.guest.count({
      where: whereConditions,
    });

    // ゲスト取得
    const guests = await prisma.guest.findMany({
      where: whereConditions,
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
        _count: {
          select: { checkins: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 最後の訪問日時を取得（別途クエリ）
    const guestIds = guests.map((g) => g.id);
    const lastVisits = await prisma.checkinRecord.findMany({
      where: {
        guestId: { in: guestIds },
        checkoutAt: { not: null },
      },
      select: {
        guestId: true,
        checkoutAt: true,
      },
      orderBy: {
        checkoutAt: "desc",
      },
      distinct: ["guestId"],
    });

    const lastVisitMap = new Map(
      lastVisits.map((lv) => [lv.guestId, lv.checkoutAt])
    );

    const guestsData: GuestData[] = guests.map((guest) => ({
      id: guest.id,
      displayId: guest.displayId,
      name: guest.name,
      contact: guest.contact,
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      totalVisits: guest._count.checkins,
      lastVisitAt: lastVisitMap.get(guest.id)?.toISOString() || null,
      createdAt: guest.createdAt.toISOString(),
    }));

    const pagination: PaginationData = {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        guests: guestsData,
        pagination,
      },
    });
  } catch (error) {
    console.error("Get admin guests error:", error);
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
