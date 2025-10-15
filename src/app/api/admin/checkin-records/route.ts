import type { NextRequest } from "next/server";
import { createSuccessResponse, withApiHandler } from "@/lib/api-handler";
import {
  type CheckinSearchParams,
  CheckinService,
  checkinSearchSchema,
} from "@/services/checkin.service";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // パラメータのパース
    const params: CheckinSearchParams = checkinSearchSchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      guestId: searchParams.get("guestId") || undefined,
      guestName: searchParams.get("guestName") || undefined,
    });

    const result = await CheckinService.getCheckinRecords(params);
    return createSuccessResponse(result);
  },
  { requireAuth: true, allowedMethods: ["GET"] },
);
