import {
  withApiHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import {
  upsertActivityLogSchema,
  ActivityLogService,
} from "@/services/activity-log.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = withApiHandler(
  async (req) => {
    const session = await getServerSession(authOptions);
    if (!session)
      return createErrorResponse("UNAUTHORIZED", "認証が必要です", 401);

    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      const date = searchParams.get("date");
      if (!date)
        return createErrorResponse("BAD_REQUEST", "dateクエリが必要です", 400);
      const data = await ActivityLogService.getLogsForDate(date);
      return createSuccessResponse(data);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const parsed = upsertActivityLogSchema.safeParse(body);
      if (!parsed.success) {
        return createErrorResponse(
          "VALIDATION_ERROR",
          "入力内容に誤りがあります",
          400,
          parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }))
        );
      }
      const result = await ActivityLogService.createOrUpdate(parsed.data);
      return createSuccessResponse(result, undefined, 200);
    }

    return createErrorResponse("METHOD_NOT_ALLOWED", "GET/POSTのみ対応", 405);
  },
  { requireAuth: true, allowedMethods: ["GET", "POST"] }
);

export { handler as GET, handler as POST };
