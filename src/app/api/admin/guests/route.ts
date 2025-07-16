import { NextRequest } from "next/server";
import { withApiHandler, createSuccessResponse } from "@/lib/api-handler";
import {
  GuestService,
  guestSearchSchema,
  GuestSearchParams,
} from "@/services/guest.service";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // パラメータのパース
    const params: GuestSearchParams = guestSearchSchema.parse({
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
    });

    const result = await GuestService.searchGuests(params);
    return createSuccessResponse(result);
  },
  { requireAuth: true, allowedMethods: ["GET"] }
);
