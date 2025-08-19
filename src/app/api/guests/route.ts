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
import { CheckinService } from "@/services/checkin.service";

export const POST = withApiHandler(
  async (request: NextRequest) => {
    // リクエストボディのバリデーション
    const validation = await validateRequest(createGuestSchema)(request);
    if ("error" in validation) return validation.error;

    const data = validation.data as CreateGuestData;

    try {
      const guest = await GuestService.createGuest(data);
      // 新規登録後に自動でチェックインを実施
      try {
        await CheckinService.checkinGuest(guest.id);
      } catch (checkinError: any) {
        // 既にチェックイン済みは異常ではないため無視（基本的に発生しない）
        if (checkinError?.message !== "ALREADY_CHECKED_IN") {
          throw checkinError;
        }
      }
      return createSuccessResponse(guest, "ゲストを登録しました", 201);
    } catch (error: any) {
      // 名前重複は許容する仕様のため分岐なし
      if (error.message === "DISPLAY_ID_GENERATION_FAILED") {
        return createErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "IDの生成に失敗しました。しばらくしてから再度お試しください",
          500
        );
      }
      if (error.message === "GUEST_NOT_FOUND") {
        // 理論上起きないが安全側対応
        return createErrorResponse("NOT_FOUND", "ゲストが見つかりません", 404);
      }
      if (error.message === "ALREADY_CHECKED_IN") {
        // 二重チェックインの場合も成功扱いにしない（整合性優先でエラー返却）
        return createErrorResponse("CONFLICT", "既にチェックイン済みです", 409);
      }
      throw error; // withApiHandlerで共通エラーハンドリング
    }
  },
  { allowedMethods: ["POST"] }
);
