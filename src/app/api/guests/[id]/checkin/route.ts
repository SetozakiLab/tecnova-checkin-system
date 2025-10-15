import type { NextRequest } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
  withApiHandler,
} from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

export const POST = withApiHandler(
  async (_request: NextRequest, context) => {
    const id = context?.params?.id;
    if (!id) {
      return createErrorResponse("BAD_REQUEST", "id が指定されていません", 400);
    }

    const checkinData = await CheckinService.checkinGuest(id);
    return createSuccessResponse(checkinData, "チェックインしました", 201);
  },
  { allowedMethods: ["POST"] },
);
