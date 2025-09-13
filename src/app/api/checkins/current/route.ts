import { withApiHandler, createSuccessResponse } from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

// 現在チェックイン中のゲスト一覧を返す
// 認証要件が今後変わる場合は options に requireAuth を追加するだけで対応可能
export const GET = withApiHandler(
  async () => {
    // Service 層でのデータ整形をそのまま返却（API レイヤーでの無駄な再マッピングを避ける）
    return createSuccessResponse(await CheckinService.getCurrentGuests());
  },
  { allowedMethods: ["GET"] }
);
