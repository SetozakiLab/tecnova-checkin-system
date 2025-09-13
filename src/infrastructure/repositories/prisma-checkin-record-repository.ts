// Infrastructure: CheckinRecord Repository Implementation
// Prismaを使用したチェックイン記録リポジトリの実装

import { prisma } from "@/lib/prisma";
import { nowInJST, getTodayStartJST, getTomorrowStartJST } from "@/lib/timezone";
import { CheckinRecordEntity, CheckinRecordWithGuest } from "@/domain/entities/checkin-record";
import { 
  ICheckinRecordRepository, 
  CheckinSearchParams, 
  CheckinSearchResult, 
  TodayStats 
} from "@/domain/repositories/checkin-record-repository";

export class PrismaCheckinRecordRepository implements ICheckinRecordRepository {
  async findById(id: string): Promise<CheckinRecordEntity | null> {
    const record = await prisma.checkinRecord.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findActiveByGuestId(guestId: string): Promise<CheckinRecordEntity | null> {
    const record = await prisma.checkinRecord.findFirst({
      where: {
        guestId,
        isActive: true,
      },
      orderBy: { checkinAt: 'desc' },
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
      orderBy: { checkinAt: 'desc' },
    });

    return records.map(record => this.mapToEntityWithGuest(record));
  }

  async search(params: CheckinSearchParams): Promise<CheckinSearchResult> {
    const { page, limit, startDate, endDate, guestId, guestName, isActive } = params;
    const skip = (page - 1) * limit;

    // WHERE条件を構築
    const where: any = {};

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
          mode: 'insensitive',
        },
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 総数とデータを並行取得
    const [totalCount, records] = await Promise.all([
      prisma.checkinRecord.count({ 
        where,
        ...(guestName && {
          include: { guest: true },
        }),
      }),
      prisma.checkinRecord.findMany({
        where,
        include: {
          guest: true,
        },
        orderBy: { checkinAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      records: records.map(record => this.mapToEntityWithGuest(record)),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getTodayStats(): Promise<TodayStats> {
    const todayStart = getTodayStartJST();
    const tomorrowStart = getTomorrowStartJST();

    const [totalCheckins, currentGuests, completedCheckins] = await Promise.all([
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
    ]);

    // 平均滞在時間を計算（分単位）
    let averageStayTime = 0;
    if (completedCheckins.length > 0) {
      const totalStayTime = completedCheckins.reduce((total, record) => {
        if (record.checkoutAt) {
          return total + (record.checkoutAt.getTime() - record.checkinAt.getTime());
        }
        return total;
      }, 0);
      averageStayTime = Math.floor(totalStayTime / completedCheckins.length / (1000 * 60));
    }

    return {
      totalCheckins,
      currentGuests,
      averageStayTime,
    };
  }

  async getStatsForPeriod(startDate: Date, endDate: Date): Promise<TodayStats> {
    const [totalCheckins, currentGuests, completedCheckins] = await Promise.all([
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
    ]);

    // 平均滞在時間を計算（分単位）
    let averageStayTime = 0;
    if (completedCheckins.length > 0) {
      const totalStayTime = completedCheckins.reduce((total, record) => {
        if (record.checkoutAt) {
          return total + (record.checkoutAt.getTime() - record.checkinAt.getTime());
        }
        return total;
      }, 0);
      averageStayTime = Math.floor(totalStayTime / completedCheckins.length / (1000 * 60));
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
      orderBy: { checkinAt: 'desc' },
      select: { checkinAt: true },
    });

    return lastRecord?.checkinAt || null;
  }

  private mapToEntity(record: any): CheckinRecordEntity {
    return {
      id: record.id,
      guestId: record.guestId,
      checkinAt: record.checkinAt,
      checkoutAt: record.checkoutAt,
      isActive: record.isActive,
    };
  }

  private mapToEntityWithGuest(record: any): CheckinRecordWithGuest {
    return {
      id: record.id,
      guestId: record.guestId,
      guestName: record.guest.name,
      guestDisplayId: record.guest.displayId,
      checkinAt: record.checkinAt,
      checkoutAt: record.checkoutAt,
      isActive: record.isActive,
    };
  }
}