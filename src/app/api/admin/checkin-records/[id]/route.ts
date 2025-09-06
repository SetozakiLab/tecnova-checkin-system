import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  withApiHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 入退場時刻編集用スキーマ
const updateCheckinRecordSchema = z.object({
  checkinAt: z.string().datetime().optional(),
  checkoutAt: z.string().datetime().nullable().optional(),
});

export const PATCH = withApiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    let body: any;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse("BAD_REQUEST", "JSON形式が不正です", 400);
    }

    const parsed = updateCheckinRecordSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "入力内容に誤りがあります",
        400,
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const record = await prisma.checkinRecord.findUnique({
      where: { id },
      include: { guest: true },
    });
    if (!record) {
      return createErrorResponse("NOT_FOUND", "レコードが見つかりません", 404);
    }

    const data: any = {};
    if (parsed.data.checkinAt) {
      data.checkinAt = new Date(parsed.data.checkinAt);
    }
    if (parsed.data.checkoutAt !== undefined) {
      data.checkoutAt = parsed.data.checkoutAt
        ? new Date(parsed.data.checkoutAt)
        : null;
      // checkoutAt が null なら isActive を true に戻す / 値があれば false
      data.isActive = data.checkoutAt ? false : true;
    }

    if (Object.keys(data).length === 0) {
      return createErrorResponse("NO_CHANGE", "変更項目がありません", 400);
    }

    // 整合性チェック: checkoutAt が checkinAt より前
    const newCheckinAt = data.checkinAt ?? record.checkinAt;
    const newCheckoutAt =
      "checkoutAt" in data ? data.checkoutAt : record.checkoutAt;
    if (newCheckoutAt && newCheckoutAt < newCheckinAt) {
      return createErrorResponse(
        "INVALID_RANGE",
        "チェックアウト時刻がチェックイン時刻より前です",
        400
      );
    }

    const updated = await prisma.checkinRecord.update({
      where: { id },
      data,
      include: { guest: true },
    });

    return createSuccessResponse(
      {
        id: updated.id,
        guestId: updated.guestId,
        guestName: updated.guest.name,
        guestDisplayId: updated.guest.displayId,
        checkinAt: updated.checkinAt.toISOString(),
        checkoutAt: updated.checkoutAt?.toISOString() || null,
        isActive: updated.isActive,
      },
      "入退場記録を更新しました"
    );
  },
  { requireAuth: true, allowedMethods: ["PATCH"] }
);

export const DELETE = withApiHandler(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "SUPER") {
      return createErrorResponse(
        "FORBIDDEN",
        "この操作を行う権限がありません",
        403
      );
    }

    const existing = await prisma.checkinRecord.findUnique({ where: { id } });
    if (!existing) {
      return createErrorResponse("NOT_FOUND", "レコードが見つかりません", 404);
    }

    // アクティブ記録の削除はゲストの在室状態を変えるため注意（仕様で許可）
    await prisma.checkinRecord.delete({ where: { id } });
    return createSuccessResponse(null, "入退場記録を削除しました");
  },
  { requireAuth: true, allowedMethods: ["DELETE"] }
);
