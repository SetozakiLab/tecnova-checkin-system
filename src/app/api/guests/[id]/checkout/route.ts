import { NextRequest } from "next/server";
import { withApiHandler, createSuccessResponse } from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

export const POST = withApiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const checkinData = await CheckinService.checkoutGuest(id);
    return createSuccessResponse(checkinData, "チェックアウトしました");
  },
  { allowedMethods: ["POST"] }
);
