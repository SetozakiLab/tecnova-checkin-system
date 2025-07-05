import { NextRequest } from "next/server";
import {
  withApiHandler,
  validateRequest,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import {
  GuestService,
  createGuestSchema,
  CreateGuestData,
} from "@/services/guest.service";

export const POST = withApiHandler(
  async (request: NextRequest) => {
    // リクエストボディのバリデーション
    const validation = await validateRequest(createGuestSchema)(request);
    if ("error" in validation) return validation.error;

    const data = validation.data as CreateGuestData;

    try {
      const guest = await GuestService.createGuest(data);
      return createSuccessResponse(guest, "ゲストを登録しました", 201);
    } catch (error: any) {
      if (error.message === "DUPLICATE_GUEST") {
        return createErrorResponse(
          "CONFLICT",
          "同じ名前のゲストが既に登録されています",
          409
        );
      }
      if (error.message === "DISPLAY_ID_GENERATION_FAILED") {
        return createErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "IDの生成に失敗しました。しばらくしてから再度お試しください",
          500
        );
      }
      throw error; // withApiHandlerで共通エラーハンドリング
    }
  },
  { allowedMethods: ["POST"] }
);
