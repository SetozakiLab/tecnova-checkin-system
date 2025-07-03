import { NextRequest, NextResponse } from "next/server";
import { prisma, calculateStayDuration } from "@/lib/db";
import { adminHistorySearchSchema } from "@/lib/validations";
import {
  ApiResponse,
  CheckinRecordDetail,
  PaginatedResponse,
} from "@/types/api";

// 入退場履歴検索 GET /api/admin/checkin-records
export async function GET(request: NextRequest) {
  try {
    // TODO: 認証チェックを追加

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guestName = searchParams.get("guestName");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // バリデーション
    const validatedData = adminHistorySearchSchema.parse({
      startDate,
      endDate,
      guestName,
      type,
      page,
      limit,
    });

    // 検索条件を構築
    const where: {
      checkinAt?: { gte?: Date; lt?: Date };
      guest?: { name: { contains: string; mode: "insensitive" } };
      isActive?: boolean;
      checkoutAt?: { not: null };
    } = {};

    if (validatedData.startDate) {
      where.checkinAt = { gte: new Date(validatedData.startDate) };
    }

    if (validatedData.endDate) {
      where.checkinAt = {
        ...where.checkinAt,
        lt: new Date(validatedData.endDate),
      };
    }

    if (validatedData.guestName) {
      where.guest = {
        name: {
          contains: validatedData.guestName,
          mode: "insensitive",
        },
      };
    }

    if (validatedData.type === "checkin") {
      where.isActive = true;
    } else if (validatedData.type === "checkout") {
      where.isActive = false;
      where.checkoutAt = { not: null };
    }

    // 総件数を取得
    const totalCount = await prisma.checkinRecord.count({ where });

    // ページネーション用の計算
    const totalPages = Math.ceil(totalCount / validatedData.limit);
    const skip = (validatedData.page - 1) * validatedData.limit;

    // 記録を取得
    const records = await prisma.checkinRecord.findMany({
      where,
      include: {
        guest: true,
      },
      orderBy: {
        checkinAt: "desc",
      },
      skip,
      take: validatedData.limit,
    });

    // 滞在時間を計算
    const recordsWithDuration = records.map((record) => ({
      id: record.id,
      guestId: record.guestId,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      checkinAt: record.checkinAt,
      checkoutAt: record.checkoutAt,
      guest: record.guest,
      stayDuration: record.checkoutAt
        ? calculateStayDuration(record.checkinAt, record.checkoutAt)
        : undefined,
    }));

    const response: ApiResponse<PaginatedResponse<CheckinRecordDetail>> = {
      success: true,
      data: {
        data: recordsWithDuration,
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
    console.error("Checkin records error:", error);

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
