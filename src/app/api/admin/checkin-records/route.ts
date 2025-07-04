import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatStayDuration } from "@/lib/date-utils";
import { ApiResponse, CheckinRecordData, PaginationData } from "@/types/api";

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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guestName = searchParams.get("guestName");
    const type = searchParams.get("type"); // 'checkin' | 'checkout'
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // クエリ条件の構築
    const whereConditions: any = {};

    if (startDate && endDate) {
      whereConditions.checkinAt = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (guestName) {
      whereConditions.guest = {
        name: {
          contains: guestName,
          mode: "insensitive",
        },
      };
    }

    if (type === "checkin") {
      // チェックインのみ
    } else if (type === "checkout") {
      whereConditions.checkoutAt = { not: null };
    }

    // 総件数取得
    const totalCount = await prisma.checkinRecord.count({
      where: whereConditions,
    });

    // レコード取得
    const records = await prisma.checkinRecord.findMany({
      where: whereConditions,
      include: {
        guest: true,
      },
      orderBy: { checkinAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const recordsData: CheckinRecordData[] = records.map((record) => ({
      id: record.id,
      guestId: record.guestId,
      guest: {
        id: record.guest.id,
        displayId: record.guest.displayId,
        name: record.guest.name,
        contact: record.guest.contact,
        createdAt: record.guest.createdAt.toISOString(),
      },
      checkinAt: record.checkinAt.toISOString(),
      checkoutAt: record.checkoutAt?.toISOString() || null,
      stayDuration: record.checkoutAt
        ? formatStayDuration(record.checkinAt, record.checkoutAt)
        : formatStayDuration(record.checkinAt),
      isActive: record.isActive,
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
        records: recordsData,
        pagination,
      },
    });
  } catch (error) {
    console.error("Get checkin records error:", error);
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
