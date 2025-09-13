import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  withApiHandler,
  validateRequest,
  createSuccessResponse,
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
  { requireAuth: true, allowedMethods: ["PUT"] }
);

export const DELETE = withApiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    await GuestService.deleteGuest(id);
    return createSuccessResponse(null, "ゲストを削除しました");
  },
  { requireAuth: true, allowedMethods: ["DELETE"] }
);
