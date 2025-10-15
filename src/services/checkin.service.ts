import { z } from "zod";
import { domain } from "@/lib/errors";
import { buildPagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import {
  getDateEndJST,
  getDateStartJST,
  getTodayStartJST,
  getTomorrowStartJST,
  nowInJST,
} from "@/lib/timezone";
import type { CheckinData, CheckinRecord, PaginationData } from "@/types/api";

// Zodスキーマ
export const checkinSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  guestId: z.string().optional(),
  guestName: z.string().optional(),
});

export type CheckinSearchParams = z.infer<typeof checkinSearchSchema>;

// チェックインサービスクラス
export class CheckinService {
  // チェックイン実行
  static async checkinGuest(guestId: string): Promise<CheckinData> {
    // ゲストの存在確認
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!guest) throw domain("GUEST_NOT_FOUND");

    // 既にチェックイン済みかチェック
    if (guest.checkins.length > 0) throw domain("ALREADY_CHECKED_IN");

    // チェックイン記録作成
    const checkinRecord = await prisma.checkinRecord.create({
      data: {
        guestId,
        checkinAt: nowInJST(),
        isActive: true,
      },
      include: {
        guest: true,
      },
    });

    return CheckinService.formatCheckinData(checkinRecord);
  }

  // チェックアウト実行
  static async checkoutGuest(guestId: string): Promise<CheckinData> {
    // アクティブなチェックイン記録を取得
    const activeCheckin = await prisma.checkinRecord.findFirst({
      where: {
        guestId,
        isActive: true,
      },
      include: {
        guest: true,
      },
    });

    if (!activeCheckin) throw domain("NOT_CHECKED_IN");

    // チェックアウト処理
    const checkinRecord = await prisma.checkinRecord.update({
      where: { id: activeCheckin.id },
      data: {
        checkoutAt: nowInJST(),
        isActive: false,
      },
      include: {
        guest: true,
      },
    });

    return CheckinService.formatCheckinData(checkinRecord);
  }

  // チェックイン記録取得（管理者用）
  static async getCheckinRecords(params: CheckinSearchParams): Promise<{
    records: CheckinRecord[];
    pagination: PaginationData;
  }> {
    const { page, limit, startDate, endDate, guestId, guestName } = params;

    // 検索条件の構築
    const whereConditions: {
      guestId?: string;
      guest?: { name: { contains: string; mode: "insensitive" } };
      checkinAt?: { gte?: Date; lte?: Date };
    } = {};

    if (guestId) {
      whereConditions.guestId = guestId;
    }

    if (guestName) {
      whereConditions.guest = {
        name: {
          contains: guestName,
          mode: "insensitive",
        },
      };
    }

    if (startDate || endDate) {
      const range: { gte?: Date; lte?: Date } = {};
      if (startDate) range.gte = getDateStartJST(startDate);
      if (endDate) range.lte = getDateEndJST(endDate);
      whereConditions.checkinAt = range;
    }

    // 総件数取得
    const totalCount = await prisma.checkinRecord.count({
      where: whereConditions,
    });

    // チェックイン記録取得
    const records = await prisma.checkinRecord.findMany({
      where: whereConditions,
      include: {
        guest: true,
      },
      orderBy: { checkinAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const recordsData: CheckinRecord[] = records.map((record) => ({
      id: record.id,
      guestId: record.guestId,
      guestName: record.guest.name,
      guestDisplayId: record.guest.displayId,
      checkinAt: record.checkinAt.toISOString(),
      checkoutAt: record.checkoutAt?.toISOString() || null,
      isActive: record.isActive,
      duration: record.checkoutAt
        ? Math.floor(
            (record.checkoutAt.getTime() - record.checkinAt.getTime()) /
              (1000 * 60),
          )
        : null,
    }));

    const pagination: PaginationData = buildPagination(page, limit, totalCount);

    return { records: recordsData, pagination };
  }

  // 現在チェックイン中のゲスト取得
  static async getCurrentGuests(): Promise<CheckinRecord[]> {
    const activeCheckins = await prisma.checkinRecord.findMany({
      where: { isActive: true },
      include: {
        guest: true,
      },
      orderBy: { checkinAt: "desc" },
    });

    const guestIds = activeCheckins.map((r) => r.guestId);
    const allVisits = await prisma.checkinRecord.findMany({
      where: { guestId: { in: guestIds } },
      select: { guestId: true, checkinAt: true, checkoutAt: true },
    });

    const statsMap = new Map<
      string,
      { totalVisitCount: number; totalStayMinutes: number }
    >();
    const now = new Date();
    for (const v of allVisits) {
      const prev = statsMap.get(v.guestId) || {
        totalVisitCount: 0,
        totalStayMinutes: 0,
      };
      prev.totalVisitCount += 1;
      const end = v.checkoutAt ?? now;
      prev.totalStayMinutes += Math.floor(
        (end.getTime() - v.checkinAt.getTime()) / (1000 * 60),
      );
      statsMap.set(v.guestId, prev);
    }

    return activeCheckins.map((record) => {
      const stat = statsMap.get(record.guestId);
      const result: import("@/types/api").CheckinRecord = {
        id: record.id,
        guestId: record.guestId,
        guestName: record.guest.name,
        guestDisplayId: record.guest.displayId,
        checkinAt: record.checkinAt.toISOString(),
        checkoutAt: null,
        isActive: true,
        duration: Math.floor(
          (Date.now() - record.checkinAt.getTime()) / (1000 * 60),
        ),
        guestGrade: record.guest.grade ?? null,
        totalVisitCount: stat?.totalVisitCount ?? 1,
        totalStayMinutes: stat?.totalStayMinutes ?? 0,
      };
      return result;
    });
  }

  // 今日チェックインした(履歴がある)ゲスト一覧取得（チェックアウト済みも含む）
  static async getTodayGuests(): Promise<CheckinRecord[]> {
    const today = getTodayStartJST();
    const tomorrow = getTomorrowStartJST();

    // 今日の全チェックイン (最初のチェックインを代表とする)
    const todayCheckins = await prisma.checkinRecord.findMany({
      where: { checkinAt: { gte: today, lt: tomorrow } },
      include: { guest: true },
      orderBy: { checkinAt: "asc" },
    });
    const representative = todayCheckins.reduce<typeof todayCheckins>(
      (acc, cur) => {
        if (!acc.some((r) => r.guestId === cur.guestId)) acc.push(cur);
        return acc;
      },
      [],
    );

    // 各ゲストの累計統計（全期間）
    const guestIds = representative.map((r) => r.guestId);
    const allVisits = await prisma.checkinRecord.findMany({
      where: { guestId: { in: guestIds } },
      select: { guestId: true, checkinAt: true, checkoutAt: true },
    });
    const statsMap = new Map<
      string,
      { totalVisitCount: number; totalStayMinutes: number }
    >();
    for (const v of allVisits) {
      const prev = statsMap.get(v.guestId) || {
        totalVisitCount: 0,
        totalStayMinutes: 0,
      };
      prev.totalVisitCount += 1;
      const end = v.checkoutAt ?? new Date();
      prev.totalStayMinutes += Math.floor(
        (end.getTime() - v.checkinAt.getTime()) / (1000 * 60),
      );
      statsMap.set(v.guestId, prev);
    }

    return representative.map((record) => {
      const stat = statsMap.get(record.guestId);
      const duration = record.checkoutAt
        ? Math.floor(
            (record.checkoutAt.getTime() - record.checkinAt.getTime()) /
              (1000 * 60),
          )
        : Math.floor((Date.now() - record.checkinAt.getTime()) / (1000 * 60));
      return {
        id: record.id,
        guestId: record.guestId,
        guestName: record.guest.name,
        guestDisplayId: record.guest.displayId,
        checkinAt: record.checkinAt.toISOString(),
        checkoutAt: record.checkoutAt?.toISOString() || null,
        isActive: record.checkoutAt == null,
        duration,
        guestGrade: record.guest.grade ?? null,
        totalVisitCount: stat?.totalVisitCount ?? 1,
        totalStayMinutes: stat?.totalStayMinutes ?? 0,
      } as import("@/types/api").CheckinRecord;
    });
  }

  /** 指定JST日付 (YYYY-MM-DD) にチェックイン履歴があるゲスト一覧取得（チェックアウト済みも含む） */
  static async getGuestsForDate(date: string): Promise<CheckinRecord[]> {
    const start = getDateStartJST(`${date}T00:00:00`);
    const end = getDateEndJST(`${date}T00:00:00`);

    const dayCheckins = await prisma.checkinRecord.findMany({
      where: { checkinAt: { gte: start, lte: end } },
      include: { guest: true },
      orderBy: { checkinAt: "asc" },
    });
    const representative = dayCheckins.reduce<typeof dayCheckins>(
      (acc, cur) => {
        if (!acc.some((r) => r.guestId === cur.guestId)) acc.push(cur);
        return acc;
      },
      [],
    );

    const guestIds = representative.map((r) => r.guestId);
    if (guestIds.length === 0) return [];
    const allVisits = await prisma.checkinRecord.findMany({
      where: { guestId: { in: guestIds } },
      select: { guestId: true, checkinAt: true, checkoutAt: true },
    });
    const statsMap = new Map<
      string,
      { totalVisitCount: number; totalStayMinutes: number }
    >();
    for (const v of allVisits) {
      const prev = statsMap.get(v.guestId) || {
        totalVisitCount: 0,
        totalStayMinutes: 0,
      };
      prev.totalVisitCount += 1;
      const endTime = v.checkoutAt ?? new Date();
      prev.totalStayMinutes += Math.floor(
        (endTime.getTime() - v.checkinAt.getTime()) / (1000 * 60),
      );
      statsMap.set(v.guestId, prev);
    }
    return representative.map((record) => {
      const stat = statsMap.get(record.guestId);
      const duration = record.checkoutAt
        ? Math.floor(
            (record.checkoutAt.getTime() - record.checkinAt.getTime()) /
              (1000 * 60),
          )
        : Math.floor((Date.now() - record.checkinAt.getTime()) / (1000 * 60));
      return {
        id: record.id,
        guestId: record.guestId,
        guestName: record.guest.name,
        guestDisplayId: record.guest.displayId,
        checkinAt: record.checkinAt.toISOString(),
        checkoutAt: record.checkoutAt?.toISOString() || null,
        isActive: record.checkoutAt == null,
        duration,
        guestGrade: record.guest.grade ?? null,
        totalVisitCount: stat?.totalVisitCount ?? 1,
        totalStayMinutes: stat?.totalStayMinutes ?? 0,
      } as import("@/types/api").CheckinRecord;
    });
  }

  // 今日の統計取得
  static async getTodayStats(): Promise<{
    totalCheckins: number;
    currentGuests: number;
    averageStayTime: number;
  }> {
    const today = getTodayStartJST();
    const tomorrow = getTomorrowStartJST();

    // 今日のチェックイン総数
    const totalCheckins = await prisma.checkinRecord.count({
      where: {
        checkinAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 現在のゲスト数
    const currentGuests = await prisma.checkinRecord.count({
      where: { isActive: true },
    });

    // 今日完了した訪問の平均滞在時間
    const completedVisits = await prisma.checkinRecord.findMany({
      where: {
        checkinAt: {
          gte: today,
          lt: tomorrow,
        },
        checkoutAt: { not: null },
      },
      select: {
        checkinAt: true,
        checkoutAt: true,
      },
    });

    let averageStayTime = 0;
    if (completedVisits.length > 0) {
      const totalStayTime = completedVisits.reduce((sum, visit) => {
        if (!visit.checkoutAt) return sum;
        const duration = visit.checkoutAt.getTime() - visit.checkinAt.getTime();
        return sum + duration;
      }, 0);
      averageStayTime = Math.floor(
        totalStayTime / (completedVisits.length * 1000 * 60),
      );
    }

    return {
      totalCheckins,
      currentGuests,
      averageStayTime,
    };
  }

  // チェックインデータのフォーマット
  private static formatCheckinData(record: {
    id: string;
    guestId: string;
    guest: { name: string; displayId: number };
    checkinAt: Date;
    checkoutAt?: Date | null;
    isActive: boolean;
  }): CheckinData {
    return {
      id: record.id,
      guestId: record.guestId,
      guestName: record.guest.name,
      guestDisplayId: record.guest.displayId,
      checkinAt: record.checkinAt.toISOString(),
      checkoutAt: record.checkoutAt ? record.checkoutAt.toISOString() : null,
      isActive: record.isActive,
    };
  }
}
