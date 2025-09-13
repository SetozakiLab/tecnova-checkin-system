import { NextRequest } from "next/server";
import {
  withApiHandler,
  validateRequest,
  createSuccessResponse,
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

    const guest = await GuestService.createGuest(data);
    // 自動チェックイン（失敗してもロールバック不要: 失敗は上位へ送出）
    await CheckinService.checkinGuest(guest.id);
    return createSuccessResponse(guest, "ゲストを登録しました", 201);
  },
  { allowedMethods: ["POST"] }
);
