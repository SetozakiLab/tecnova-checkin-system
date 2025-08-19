import { NextRequest } from "next/server";
import { withApiHandler, createSuccessResponse } from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const currentGuests = await CheckinService.getCurrentGuests();
    return createSuccessResponse(currentGuests);
  },
  { allowedMethods: ["GET"] }
);
