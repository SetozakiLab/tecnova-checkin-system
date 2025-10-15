import { z } from "zod";
import { GRADE_DEFINITIONS } from "@/domain/value-objects/grade";
import {
  createErrorResponse,
  createSuccessResponse,
  withApiHandler,
} from "@/lib/api-handler";
import { GuestService } from "@/services/guest.service";

const gradeValues = GRADE_DEFINITIONS.map((g) => g.value) as [
  (typeof GRADE_DEFINITIONS)[number]["value"],
  ...(typeof GRADE_DEFINITIONS)[number]["value"][],
];

const gradeEnum = z.enum(gradeValues);

const statusEnum = z.enum(["ALL", "CHECKED_IN", "CHECKED_OUT"] as const);

const exportGuestsSchema = z
  .object({
    keyword: z.string().max(100).optional(),
    grades: z.array(gradeEnum).optional(),
    status: statusEnum.optional().default("ALL"),
    registeredStart: z
      .string()
      .optional()
      .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
        message: "有効な日付を入力してください",
      }),
    registeredEnd: z
      .string()
      .optional()
      .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
        message: "有効な日付を入力してください",
      }),
    minTotalVisits: z.coerce.number().int().min(0).optional(),
    includeVisitStats: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.registeredStart && data.registeredEnd) {
      const start = new Date(data.registeredStart);
      const end = new Date(data.registeredEnd);
      if (start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registeredEnd"],
          message: "登録日の終了日は開始日以降の日付を指定してください",
        });
      }
    }
  });

const handler = withApiHandler(
  async (request) => {
    const body = await request.json().catch(() => null);
    const parsed = exportGuestsSchema.safeParse(body);
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

    const { grades, ...rest } = parsed.data;
    const data = await GuestService.exportGuests({
      ...rest,
      grades: grades && grades.length > 0 ? grades : undefined,
    });

    return createSuccessResponse(data);
  },
  { requireAuth: true, allowedMethods: ["POST"] },
);

export { handler as POST };
