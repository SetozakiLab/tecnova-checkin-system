import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequest,
  withApiHandler,
} from "@/lib/api-handler";
import { authOptions } from "@/lib/auth";
import {
  GuestService,
  type UpdateGuestData,
  updateGuestSchema,
} from "@/services/guest.service";

export const PUT = withApiHandler(
  async (request: NextRequest, context) => {
    const id = context?.params?.id;
    if (!id) {
      return createErrorResponse("BAD_REQUEST", "id が指定されていません", 400);
    }

    // 権限チェック: MANAGER も更新(PUT)は許可。削除(DELETE)のみ禁止ポリシー。
    // ここでは明示的な拒否は行わない。
    await getServerSession(authOptions); // セッション利用 (将来ロールごとのフィールド制御を追加する場合に備え保持)

    // リクエストボディのバリデーション
    const validation = await validateRequest(updateGuestSchema)(request);
    if ("error" in validation) return validation.error;

    const data = validation.data as UpdateGuestData;

    const guest = await GuestService.updateGuest(id, data);
    return createSuccessResponse(guest, "ゲスト情報を更新しました");
  },
  { requireAuth: true, allowedMethods: ["PUT"] },
);

export const DELETE = withApiHandler(
  async (_request: NextRequest, context) => {
    const id = context?.params?.id;
    if (!id) {
      return createErrorResponse("BAD_REQUEST", "id が指定されていません", 400);
    }

    await GuestService.deleteGuest(id);
    return createSuccessResponse(null, "ゲストを削除しました");
  },
  { requireAuth: true, allowedMethods: ["DELETE"] },
);
