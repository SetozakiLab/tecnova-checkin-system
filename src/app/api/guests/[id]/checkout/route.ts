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
      const checkinData = await CheckinService.checkoutGuest(id);
      return createSuccessResponse(checkinData, "チェックアウトしました");
    } catch (error: any) {
      if (error.message === "NOT_CHECKED_IN") {
        return createErrorResponse(
          "BAD_REQUEST",
          "チェックインしていません",
          400
        );
      }
      throw error; // withApiHandlerで共通エラーハンドリング
    }
  },
  { allowedMethods: ["POST"] }
);
