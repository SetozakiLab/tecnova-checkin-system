import { NextRequest, NextResponse } from "next/server";
import { prisma, isGuestCheckedIn } from "@/lib/db";
import { adminGuestSearchSchema } from "@/lib/validations";
import { ApiResponse, GuestWithStatus, PaginatedResponse } from "@/types/api";

// ゲスト一覧 GET /api/admin/guests
export async function GET(request: NextRequest) {
  try {
    // TODO: 認証チェックを追加

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // バリデーション
    const validatedData = adminGuestSearchSchema.parse({
      search,
      page,
      limit,
    });

    // 検索条件を構築
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        displayId?: number;
      }>;
    } = {};

    if (validatedData.search) {
      const isNumeric = /^\d+$/.test(validatedData.search);

      if (isNumeric) {
        const displayId = parseInt(validatedData.search);
        where.OR = [
          { name: { contains: validatedData.search, mode: "insensitive" } },
          { displayId },
        ];
      } else {
        where.OR = [
          { name: { contains: validatedData.search, mode: "insensitive" } },
        ];
      }
    }

    // 総件数を取得
    const totalCount = await prisma.guest.count({ where });

    // ページネーション用の計算
    const totalPages = Math.ceil(totalCount / validatedData.limit);
    const skip = (validatedData.page - 1) * validatedData.limit;

    // ゲストを取得
    const guests = await prisma.guest.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: validatedData.limit,
    });

    // 各ゲストの状態を取得
    const guestsWithStatus: GuestWithStatus[] = await Promise.all(
      guests.map(
        async (guest: {
          id: string;
          displayId: number;
          name: string;
          contact: string | null;
          createdAt: Date;
          updatedAt: Date;
        }) => {
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

          return {
            ...guest,
            isCurrentlyCheckedIn: isCheckedIn,
            lastVisitAt: lastVisit?.checkinAt || null,
            totalVisits,
          };
        }
      )
    );

    const response: ApiResponse<PaginatedResponse<GuestWithStatus>> = {
      success: true,
      data: {
        data: guestsWithStatus,
        pagination: {
          page: validatedData.page,
          limit: validatedData.limit,
          totalCount,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin guests error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "検索パラメータに誤りがあります",
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
