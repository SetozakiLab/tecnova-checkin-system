import { createSuccessResponse, withApiHandler } from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

// 今日チェックイン履歴があるゲスト一覧（CheckinService に委譲）
export const GET = withApiHandler(
  async () => {
    const data = await CheckinService.getTodayGuests();
    // フロントで必要な最小フィールドのみ返却 (page.tsx 側で guestId/displayId/name/grade 使用)
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
