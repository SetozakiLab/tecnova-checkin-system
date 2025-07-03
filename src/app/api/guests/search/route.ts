import { NextRequest, NextResponse } from "next/server";
import { prisma, isGuestCheckedIn } from "@/lib/db";
import { guestSearchSchema } from "@/lib/validations";
import { ApiResponse, GuestSearchResult } from "@/types/api";

// ゲスト検索 GET /api/guests/search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    // バリデーション
    const validatedData = guestSearchSchema.parse({ q, limit });

    // 名前または displayId で検索
    const isNumeric = /^\d+$/.test(validatedData.q);

    let guests;
    if (isNumeric) {
      // 数値の場合は displayId で検索
      const displayId = parseInt(validatedData.q);
      guests = await prisma.guest.findMany({
        where: {
          displayId: displayId,
        },
        take: validatedData.limit,
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // 文字列の場合は名前で部分一致検索
      guests = await prisma.guest.findMany({
        where: {
          name: {
            contains: validatedData.q,
            mode: "insensitive",
          },
        },
        take: validatedData.limit,
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // 各ゲストのチェックイン状態を取得
    const guestsWithStatus: GuestSearchResult[] = await Promise.all(
      guests.map(
        async (guest: { id: string; displayId: number; name: string }) => {
          const isCheckedIn = await isGuestCheckedIn(guest.id);
          const lastCheckin = await prisma.checkinRecord.findFirst({
            where: { guestId: guest.id },
            orderBy: { checkinAt: "desc" },
          });

          return {
            id: guest.id,
            displayId: guest.displayId,
            name: guest.name,
            isCurrentlyCheckedIn: isCheckedIn,
            lastCheckinAt: lastCheckin?.checkinAt || null,
          };
        }
      )
    );

    const response: ApiResponse<GuestSearchResult[]> = {
      success: true,
      data: guestsWithStatus,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Guest search error:", error);

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
