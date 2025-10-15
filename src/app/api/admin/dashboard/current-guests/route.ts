import { createSuccessResponse, withApiHandler } from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

export const GET = withApiHandler(
  async () => {
    const currentGuests = await CheckinService.getCurrentGuests();
    return createSuccessResponse(currentGuests);
  },
  { requireAuth: true, allowedMethods: ["GET"] },
);
