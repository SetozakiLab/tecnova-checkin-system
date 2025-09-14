import {
  withApiHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-handler";
import { ActivityLogService } from "@/services/activity-log.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = { id: string } & Record<string, string>;

const handler = withApiHandler<Params>(
  async (req, ctx) => {
    if (req.method !== "DELETE") {
      return createErrorResponse("METHOD_NOT_ALLOWED", "DELETEのみ対応", 405);
    }
    const session = await getServerSession(authOptions);
    if (!session)
      return createErrorResponse("UNAUTHORIZED", "認証が必要です", 401);

    const role =
      (session.user &&
      typeof session.user === "object" &&
      "role" in session.user
        ? (session.user as { role?: string }).role
        : undefined) || "MANAGER";

    const { id } = ctx.params;
    const result = await ActivityLogService.delete(id, role);
    return createSuccessResponse(result, undefined, 200);
  },
  { requireAuth: true, allowedMethods: ["DELETE"] }
);

export { handler as DELETE };
