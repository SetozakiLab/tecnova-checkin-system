import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { domain } from "@/lib/errors";
import { floorTo30MinSlotJST } from "@/lib/time-slot";
import { ACTIVITY_CATEGORIES } from "@/domain/activity-category";

export const upsertActivityLogSchema = z.object({
  guestId: z.string().min(1),
  categories: z
    .array(z.enum(ACTIVITY_CATEGORIES))
    .min(1, "カテゴリを1つ以上選択してください")
    .max(5, "カテゴリは最大5つまで"),
  description: z
    .string()
    .max(100, "説明は100文字以内")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  mentorNote: z
    .string()
    .max(200, "メンターノートは200文字以内")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  timestamp: z.string().datetime().optional(),
});

export type UpsertActivityLogInput = z.infer<typeof upsertActivityLogSchema>;

export class ActivityLogService {
  /**
   * 指定ゲスト・カテゴリ・説明で timeslot をJST30分単位に正規化し upsert。
   * 同一 (guestId, timeslotStart) が存在すれば更新、それ以外は新規作成。
   */
  static async createOrUpdate(input: UpsertActivityLogInput) {
    const { guestId, categories, description, mentorNote } = input;
    const baseDate = input.timestamp ? new Date(input.timestamp) : new Date();
    const timeslotStart = floorTo30MinSlotJST(baseDate);

    // ゲスト存在チェック
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw domain("GUEST_NOT_FOUND");

    // upsert: unique (guestId, timeslotStart)
    const log = await prisma.activityLog.upsert({
      where: { guestId_timeslotStart: { guestId, timeslotStart } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { categories: categories as any, description, mentorNote },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: {
        guestId,
        categories: categories as any,
        description,
        mentorNote,
        timeslotStart,
      },
    });

    return this.format(log);
  }

  /** 削除 (SUPER のみ) */
  static async delete(id: string, role: string) {
    if (role !== "SUPER") throw domain("FORBIDDEN");
    // 存在チェック
    const existing = await prisma.activityLog.findUnique({ where: { id } });
    if (!existing) throw domain("NOT_FOUND");
    await prisma.activityLog.delete({ where: { id } });
    return { id };
  }

  /** 指定JST日付 (YYYY-MM-DD) の全活動ログを timeslotStart 昇順で取得 */
  static async getLogsForDate(date: string) {
    // JST日の開始と終了をUTCに換算
    const start = new Date(`${date}T00:00:00+09:00`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const logs = await prisma.activityLog.findMany({
      where: { timeslotStart: { gte: start, lt: end } },
      orderBy: { timeslotStart: "asc" },
    });
    // 型が古いクライアントの場合 category フィールドしかないためマッピング
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (logs as any[]).map((raw) => {
      if (Array.isArray(raw.categories)) return this.format(raw as any);
      const fallback = {
        id: raw.id,
        guestId: raw.guestId,
        categories: raw.category ? [raw.category] : [],
        description: raw.description ?? null,
        mentorNote: raw.mentorNote ?? null,
        timeslotStart: raw.timeslotStart,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      };
      return this.format(fallback);
    });
  }

  // prisma generate 前後で型が異なる可能性があるため category は any 許容
  private static format(log: {
    id: string;
    guestId: string;
    categories: string[];
    description: string | null;
    mentorNote: string | null;
    timeslotStart: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: log.id,
      guestId: log.guestId,
      categories: log.categories,
      description: log.description ?? undefined,
      mentorNote: log.mentorNote ?? undefined,
      timeslotStart: log.timeslotStart.toISOString(),
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    };
  }
}
