import { NextRequest } from "next/server";
import {
  withApiHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import { GuestService } from "@/services/guest.service";

export const GET = withApiHandler(
  async (_request: NextRequest, context) => {
    const id = context?.params?.id;
    if (!id) {
      return createErrorResponse("BAD_REQUEST", "id が指定されていません", 400);
    }

    const guest = await GuestService.getGuestById(id);

    if (!guest) {
      return createErrorResponse("NOT_FOUND", "ゲストが見つかりません", 404);
    }
    return createSuccessResponse(guest);
  },
  { allowedMethods: ["GET"] }
);
