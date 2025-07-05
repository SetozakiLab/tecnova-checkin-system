import { NextRequest } from "next/server";
import { withApiHandler, createSuccessResponse } from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const stats = await CheckinService.getTodayStats();
    return createSuccessResponse(stats);
  },
  { requireAuth: true, allowedMethods: ["GET"] }
);
