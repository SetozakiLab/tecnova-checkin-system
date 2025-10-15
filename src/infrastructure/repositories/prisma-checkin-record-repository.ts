// Infrastructure: CheckinRecord Repository Implementation
// Prismaを使用したチェックイン記録リポジトリの実装

import type {
  CheckinRecordEntity,
  CheckinRecordWithGuest,
} from "@/domain/entities/checkin-record";
import type {
  CheckinSearchParams,
  CheckinSearchResult,
  GuestDailyStatItem,
  GuestDetailStats,
  ICheckinRecordRepository,
  TodayStats,
} from "@/domain/repositories/checkin-record-repository";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  getTodayStartJST,
  getTomorrowStartJST,
  nowInJST,
} from "@/lib/timezone";

export class PrismaCheckinRecordRepository implements ICheckinRecordRepository {
  async findById(id: string): Promise<CheckinRecordEntity | null> {
    const record = await prisma.checkinRecord.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findActiveByGuestId(
    guestId: string,
  ): Promise<CheckinRecordEntity | null> {
    const record = await prisma.checkinRecord.findFirst({
      where: {
        guestId,
        isActive: true,
      },
      orderBy: { checkinAt: "desc" },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findCurrentCheckins(): Promise<CheckinRecordWithGuest[]> {
    const records = await prisma.checkinRecord.findMany({
      where: { isActive: true },
      include: {
        guest: true,
      },
      orderBy: { checkinAt: "desc" },
    });

    // 取得したゲストID一覧
    const guestIds = records.map((r) => r.guestId);

    // 過去含む累計訪問 & 滞在時間をまとめて取得
    // 全訪問を取得（件数が多くなる場合は期間制限や集計SQL最適化要検討）
    const allVisits = await prisma.checkinRecord.findMany({
      where: { guestId: { in: guestIds } },
      select: {
        guestId: true,
        checkinAt: true,
        checkoutAt: true,
        isActive: true,
      },
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

    return records.map((record) => {
      const base = this.mapToEntityWithGuest(record);
      const stat = statsMap.get(record.guestId);
      return {
        ...base,
        guestGrade: record.guest.grade ?? null,
        totalVisitCount: stat?.totalVisitCount ?? 1,
        totalStayMinutes: stat?.totalStayMinutes ?? 0,
      };
    });
  }

  async search(params: CheckinSearchParams): Promise<CheckinSearchResult> {
    const { page, limit, startDate, endDate, guestId, guestName, isActive } =
      params;
    const skip = (page - 1) * limit;

    // WHERE条件を構築
    const where: Prisma.CheckinRecordWhereInput = {};

    if (startDate && endDate) {
      where.checkinAt = {
        gte: startDate,
        lt: endDate,
      };
    } else if (startDate) {
      where.checkinAt = {
        gte: startDate,
      };
    } else if (endDate) {
      where.checkinAt = {
        lt: endDate,
      };
    }

    if (guestId) {
      where.guestId = guestId;
    }

    if (guestName) {
      where.guest = {
        name: {
          contains: guestName,
          mode: "insensitive",
        },
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 総数とデータを並行取得
    const [totalCount, records] = await Promise.all([
      // count では include は使用できないため単純に where のみ
      prisma.checkinRecord.count({
        where,
      }),
      prisma.checkinRecord.findMany({
        where,
        include: {
          guest: true,
        },
        orderBy: { checkinAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      records: records.map((record) => this.mapToEntityWithGuest(record)),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getTodayStats(): Promise<TodayStats> {
    const todayStart = getTodayStartJST();
    const tomorrowStart = getTomorrowStartJST();

    const [totalCheckins, currentGuests, completedCheckins] = await Promise.all(
      [
        // 今日のチェックイン総数
        prisma.checkinRecord.count({
          where: {
            checkinAt: {
              gte: todayStart,
              lt: tomorrowStart,
            },
          },
        }),
        // 現在の滞在者数
        prisma.checkinRecord.count({
          where: { isActive: true },
        }),
        // 今日の完了したチェックイン記録（平均滞在時間計算用）
        prisma.checkinRecord.findMany({
          where: {
            checkinAt: {
              gte: todayStart,
              lt: tomorrowStart,
            },
            checkoutAt: {
              not: null,
            },
          },
          select: {
            checkinAt: true,
            checkoutAt: true,
          },
        }),
      ],
    );

    // 平均滞在時間を計算（分単位）
    let averageStayTime = 0;
    if (completedCheckins.length > 0) {
      const totalStayTime = completedCheckins.reduce((total, record) => {
        if (record.checkoutAt) {
          return (
            total + (record.checkoutAt.getTime() - record.checkinAt.getTime())
          );
        }
        return total;
      }, 0);
      averageStayTime = Math.floor(
        totalStayTime / completedCheckins.length / (1000 * 60),
      );
    }

    return {
      totalCheckins,
      currentGuests,
      averageStayTime,
    };
  }

  async getStatsForPeriod(startDate: Date, endDate: Date): Promise<TodayStats> {
    const [totalCheckins, currentGuests, completedCheckins] = await Promise.all(
      [
        // 期間内のチェックイン総数
        prisma.checkinRecord.count({
          where: {
            checkinAt: {
              gte: startDate,
              lt: endDate,
            },
          },
        }),
        // 現在の滞在者数（期間に関係なく）
        prisma.checkinRecord.count({
          where: { isActive: true },
        }),
        // 期間内の完了したチェックイン記録
        prisma.checkinRecord.findMany({
          where: {
            checkinAt: {
              gte: startDate,
              lt: endDate,
            },
            checkoutAt: {
              not: null,
            },
          },
          select: {
            checkinAt: true,
            checkoutAt: true,
          },
        }),
      ],
    );

    // 平均滞在時間を計算（分単位）
    let averageStayTime = 0;
    if (completedCheckins.length > 0) {
      const totalStayTime = completedCheckins.reduce((total, record) => {
        if (record.checkoutAt) {
          return (
            total + (record.checkoutAt.getTime() - record.checkinAt.getTime())
          );
        }
        return total;
      }, 0);
      averageStayTime = Math.floor(
        totalStayTime / completedCheckins.length / (1000 * 60),
      );
    }

    return {
      totalCheckins,
      currentGuests,
      averageStayTime,
    };
  }

  async create(guestId: string): Promise<CheckinRecordEntity> {
    const record = await prisma.checkinRecord.create({
      data: {
        guestId,
        checkinAt: nowInJST(),
        isActive: true,
      },
    });

    return this.mapToEntity(record);
  }

  async checkout(id: string): Promise<CheckinRecordEntity> {
    const record = await prisma.checkinRecord.update({
      where: { id },
      data: {
        checkoutAt: nowInJST(),
        isActive: false,
      },
    });

    return this.mapToEntity(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.checkinRecord.delete({
      where: { id },
    });
  }

  async getTotalVisitsByGuestId(guestId: string): Promise<number> {
    return prisma.checkinRecord.count({
      where: { guestId },
    });
  }

  async getLastVisitByGuestId(guestId: string): Promise<Date | null> {
    const lastRecord = await prisma.checkinRecord.findFirst({
      where: { guestId },
      orderBy: { checkinAt: "desc" },
      select: { checkinAt: true },
    });

    return lastRecord?.checkinAt || null;
  }

  async getGuestDailyStats(
    guestId: string,
    days: number = 30,
  ): Promise<GuestDailyStatItem[]> {
    const end = getTomorrowStartJST();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const records = await prisma.checkinRecord.findMany({
      where: {
        guestId,
        checkinAt: { gte: start, lt: end },
      },
      select: {
        checkinAt: true,
        checkoutAt: true,
        isActive: true,
      },
      orderBy: { checkinAt: "asc" },
    });

    // 日付キー => 集計
    const map = new Map<string, { visitCount: number; stayMinutes: number }>();
    const now = new Date();
    for (const r of records) {
      const dateKey = new Date(r.checkinAt.getTime());
      // JST日付 (既存 util がJST開始与える前提) → YYYY-MM-DD
      const yyyy = dateKey.getFullYear();
      const mm = String(dateKey.getMonth() + 1).padStart(2, "0");
      const dd = String(dateKey.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      const item = map.get(key) || { visitCount: 0, stayMinutes: 0 };
      item.visitCount += 1;
      const endTime = r.checkoutAt ?? (r.isActive ? now : r.checkinAt);
      const stay = Math.max(
        0,
        Math.floor((endTime.getTime() - r.checkinAt.getTime()) / (1000 * 60)),
      );
      item.stayMinutes += stay;
      map.set(key, item);
    }

    // 期間全日を埋める
    const daily: GuestDailyStatItem[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(end.getTime() - (i + 1) * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      const val = map.get(key) || { visitCount: 0, stayMinutes: 0 };
      daily.push({
        date: key,
        visitCount: val.visitCount,
        stayMinutes: val.stayMinutes,
      });
    }
    return daily;
  }

  async getGuestDetailStats(
    guestId: string,
    days: number = 30,
  ): Promise<GuestDetailStats> {
    const [totalVisitCount, lastVisitAt, activeRecord, daily] =
      await Promise.all([
        this.getTotalVisitsByGuestId(guestId),
        this.getLastVisitByGuestId(guestId),
        this.findActiveByGuestId(guestId),
        this.getGuestDailyStats(guestId, days),
      ]);

    // 累計滞在時間算出 (全訪問走査) ※最適化余地: raw SQL 集計
    const allRecords = await prisma.checkinRecord.findMany({
      where: { guestId },
      select: { checkinAt: true, checkoutAt: true, isActive: true },
    });
    const now = new Date();
    const totalStayMinutes = allRecords.reduce((sum, r) => {
      const end = r.checkoutAt ?? (r.isActive ? now : r.checkinAt);
      return (
        sum +
        Math.max(
          0,
          Math.floor((end.getTime() - r.checkinAt.getTime()) / (1000 * 60)),
        )
      );
    }, 0);

    return {
      guestId,
      totalVisitCount,
      totalStayMinutes,
      lastVisitAt,
      isCurrentlyCheckedIn: !!activeRecord,
      daily,
    };
  }

  private mapToEntity(
    record: Prisma.CheckinRecordUncheckedCreateInput & { id: string },
  ): CheckinRecordEntity {
    const checkinAt =
      typeof record.checkinAt === "string"
        ? new Date(record.checkinAt)
        : record.checkinAt;
    const checkoutAt = record.checkoutAt
      ? typeof record.checkoutAt === "string"
        ? new Date(record.checkoutAt)
        : record.checkoutAt
      : null;
    return {
      id: record.id,
      guestId: record.guestId,
      checkinAt,
      checkoutAt,
      isActive: record.isActive ?? false,
    };
  }

  private mapToEntityWithGuest(record: {
    id: string;
    guestId: string;
    checkinAt: Date | string;
    checkoutAt: Date | string | null;
    isActive: boolean | undefined;
    guest: { name: string; displayId: number; grade?: string | null };
  }): CheckinRecordWithGuest {
    const checkinAt =
      typeof record.checkinAt === "string"
        ? new Date(record.checkinAt)
        : record.checkinAt;
    const checkoutAt = record.checkoutAt
      ? typeof record.checkoutAt === "string"
        ? new Date(record.checkoutAt)
        : record.checkoutAt
      : null;
    return {
      id: record.id,
      guestId: record.guestId,
      guestName: record.guest.name,
      guestDisplayId: record.guest.displayId,
      checkinAt,
      checkoutAt,
      isActive: record.isActive ?? false,
      guestGrade: record.guest.grade ?? null,
    } as CheckinRecordWithGuest;
  }
}
