import {
  createErrorResponse,
  createSuccessResponse,
  withApiHandler,
} from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

// 指定日付にチェックイン履歴があるゲスト一覧
export const GET = withApiHandler(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    if (!date)
      return createErrorResponse("BAD_REQUEST", "dateクエリが必要です", 400);
    const data = await CheckinService.getGuestsForDate(date);
    return createSuccessResponse(
      data.map((r) => ({
        guestId: r.guestId,
        id: r.guestId,
        name: r.guestName,
        displayId: r.guestDisplayId,
        grade: r.guestGrade ?? null,
        checkinAt: r.checkinAt,
        checkoutAt: r.checkoutAt,
        isActive: r.isActive,
      })),
    );
  },
  { requireAuth: true, allowedMethods: ["GET"] },
);
