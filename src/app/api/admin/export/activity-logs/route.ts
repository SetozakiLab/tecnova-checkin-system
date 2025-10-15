import { z } from "zod";
import { ACTIVITY_CATEGORIES } from "@/domain/activity-category";
import {
  createErrorResponse,
  createSuccessResponse,
  withApiHandler,
} from "@/lib/api-handler";
import { ActivityLogService } from "@/services/activity-log.service";

const exportActivityLogSchema = z
  .object({
    startDate: z
      .string()
      .min(1, "開始日を入力してください")
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "有効な日付を入力してください",
      }),
    endDate: z
      .string()
      .min(1, "終了日を入力してください")
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "有効な日付を入力してください",
      }),
    categories: z.array(z.enum(ACTIVITY_CATEGORIES)).optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "終了日は開始日以降の日付を指定してください",
      });
    }
  });

const handler = withApiHandler(
  async (request) => {
    const body = await request.json().catch(() => null);
    const parsed = exportActivityLogSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "入力内容に誤りがあります",
        400,
        parsed.error.errors.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    const { categories, ...rest } = parsed.data;
    const data = await ActivityLogService.exportLogs({
      ...rest,
      categories: categories && categories.length > 0 ? categories : undefined,
    });
    return createSuccessResponse(data);
  },
  { requireAuth: true, allowedMethods: ["POST"] },
);

export { handler as POST };
