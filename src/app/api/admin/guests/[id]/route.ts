import { NextRequest } from "next/server";
import {
  withApiHandler,
  validateRequest,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import {
  GuestService,
  updateGuestSchema,
  UpdateGuestData,
} from "@/services/guest.service";

export const PUT = withApiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    // リクエストボディのバリデーション
    const validation = await validateRequest(updateGuestSchema)(request);
    if ("error" in validation) return validation.error;

    const data = validation.data as UpdateGuestData;

    try {
      const guest = await GuestService.updateGuest(id, data);
      return createSuccessResponse(guest, "ゲスト情報を更新しました");
    } catch (error: any) {
      if (error.message === "GUEST_NOT_FOUND") {
        return createErrorResponse("NOT_FOUND", "ゲストが見つかりません", 404);
      }
      // 名前重複は許容
      throw error; // withApiHandlerで共通エラーハンドリング
    }
  },
  { requireAuth: true, allowedMethods: ["PUT"] }
);

export const DELETE = withApiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    try {
      await GuestService.deleteGuest(id);
      return createSuccessResponse(null, "ゲストを削除しました");
    } catch (error: any) {
      if (error.message === "GUEST_NOT_FOUND") {
        return createErrorResponse("NOT_FOUND", "ゲストが見つかりません", 404);
      }
      if (error.message === "GUEST_CURRENTLY_CHECKED_IN") {
        return createErrorResponse(
          "CONFLICT",
          "現在チェックイン中のゲストは削除できません",
          409
        );
      }
      throw error; // withApiHandlerで共通エラーハンドリング
    }
  },
  { requireAuth: true, allowedMethods: ["DELETE"] }
);
