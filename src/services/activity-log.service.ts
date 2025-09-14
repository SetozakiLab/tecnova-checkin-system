import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { domain } from "@/lib/errors";
import { floorTo30MinSlotJST } from "@/lib/time-slot";

export const upsertActivityLogSchema = z.object({
  guestId: z.string().min(1),
  category: z.enum(["STUDY", "MEETING", "EVENT", "PROJECT", "OTHER"] as const),
  description: z
    .string()
    .min(1, "説明は1文字以上")
    .max(100, "説明は100文字以内"),
  // ISO文字列 (任意; 指定なければ現在時刻を利用)
  timestamp: z.string().datetime().optional(),
});

export type UpsertActivityLogInput = z.infer<typeof upsertActivityLogSchema>;

export class ActivityLogService {
  /**
   * 指定ゲスト・カテゴリ・説明で timeslot をJST30分単位に正規化し upsert。
   * 同一 (guestId, timeslotStart) が存在すれば更新、それ以外は新規作成。
   */
  static async createOrUpdate(input: UpsertActivityLogInput) {
    const { guestId, category, description } = input;
    const baseDate = input.timestamp ? new Date(input.timestamp) : new Date();
    const timeslotStart = floorTo30MinSlotJST(baseDate);

    // ゲスト存在チェック
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw domain("GUEST_NOT_FOUND");

    // upsert: unique (guestId, timeslotStart)
    const log = await prisma.activityLog.upsert({
      where: { guestId_timeslotStart: { guestId, timeslotStart } },
      update: { category, description },
      create: { guestId, category, description, timeslotStart },
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
    return logs.map(this.format);
  }

  private static format(log: {
    id: string;
    guestId: string;
    category: string;
    description: string;
    timeslotStart: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: log.id,
      guestId: log.guestId,
      category: log.category,
      description: log.description,
      timeslotStart: log.timeslotStart.toISOString(),
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    };
  }
}
