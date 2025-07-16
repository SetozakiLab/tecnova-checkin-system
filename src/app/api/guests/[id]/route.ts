import { NextRequest } from "next/server";
import {
  withApiHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import { GuestService } from "@/services/guest.service";

export const GET = withApiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const guest = await GuestService.getGuestById(id);

    if (!guest) {
      return createErrorResponse("NOT_FOUND", "ゲストが見つかりません", 404);
    }

    return createSuccessResponse(guest);
  },
  { allowedMethods: ["GET"] }
);
