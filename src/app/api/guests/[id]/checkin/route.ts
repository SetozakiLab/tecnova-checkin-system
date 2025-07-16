import { NextRequest } from "next/server";
import {
  withApiHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import { CheckinService } from "@/services/checkin.service";

export const POST = withApiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    try {
      const checkinData = await CheckinService.checkinGuest(id);
      return createSuccessResponse(checkinData, "チェックインしました", 201);
    } catch (error: any) {
      if (error.message === "GUEST_NOT_FOUND") {
        return createErrorResponse("NOT_FOUND", "ゲストが見つかりません", 404);
      }
      if (error.message === "ALREADY_CHECKED_IN") {
        return createErrorResponse("CONFLICT", "既にチェックイン済みです", 409);
      }
      throw error; // withApiHandlerで共通エラーハンドリング
    }
  },
  { allowedMethods: ["POST"] }
);
