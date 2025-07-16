import { NextRequest } from "next/server";
import {
  withApiHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import { GuestService } from "@/services/guest.service";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "検索語を入力してください",
        400
      );
    }

    const guests = await GuestService.searchGuestsPublic(query);
    return createSuccessResponse(guests);
  },
  { allowedMethods: ["GET"] }
);
