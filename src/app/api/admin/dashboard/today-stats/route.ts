import { createSuccessResponse, withApiHandler } from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

export const GET = withApiHandler(
  async () => {
    const stats = await CheckinService.getTodayStats();
    return createSuccessResponse(stats);
  },
  { requireAuth: true, allowedMethods: ["GET"] },
);
