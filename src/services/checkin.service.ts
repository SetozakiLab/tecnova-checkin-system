import { prisma } from "@/lib/prisma";
import { CheckinData, CheckinRecord, PaginationData } from "@/types/api";
import { z } from "zod";
import { 
  nowInJST, 
  getTodayStartJST, 
  getTomorrowStartJST, 
  getDateStartJST, 
  getDateEndJST 
} from "@/lib/timezone";

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

    if (!guest) {
      throw new Error("GUEST_NOT_FOUND");
    }

    // 既にチェックイン済みかチェック
    if (guest.checkins.length > 0) {
      throw new Error("ALREADY_CHECKED_IN");
    }

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

    return this.formatCheckinData(checkinRecord);
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

    if (!activeCheckin) {
      throw new Error("NOT_CHECKED_IN");
    }

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

    return this.formatCheckinData(checkinRecord);
  }

  // チェックイン記録取得（管理者用）
  static async getCheckinRecords(params: CheckinSearchParams): Promise<{
    records: CheckinRecord[];
    pagination: PaginationData;
  }> {
    const { page, limit, startDate, endDate, guestId, guestName } = params;

    // 検索条件の構築
    const whereConditions: any = {};

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
      whereConditions.checkinAt = {};
      if (startDate) {
        whereConditions.checkinAt.gte = getDateStartJST(startDate);
      }
      if (endDate) {
        whereConditions.checkinAt.lte = getDateEndJST(endDate);
      }
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
              (1000 * 60)
          )
        : null,
    }));

    const pagination: PaginationData = {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };

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

    return activeCheckins.map((record) => ({
      id: record.id,
      guestId: record.guestId,
      guestName: record.guest.name,
      guestDisplayId: record.guest.displayId,
      checkinAt: record.checkinAt.toISOString(),
      checkoutAt: null,
      isActive: true,
      duration: Math.floor(
        (Date.now() - record.checkinAt.getTime()) / (1000 * 60)
      ),
    }));
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
        const duration =
          visit.checkoutAt!.getTime() - visit.checkinAt.getTime();
        return sum + duration;
      }, 0);
      averageStayTime = Math.floor(
        totalStayTime / (completedVisits.length * 1000 * 60)
      );
    }

    return {
      totalCheckins,
      currentGuests,
      averageStayTime,
    };
  }

  // チェックインデータのフォーマット
  private static formatCheckinData(record: any): CheckinData {
    return {
      id: record.id,
      guestId: record.guestId,
      guestName: record.guest.name,
      guestDisplayId: record.guest.displayId,
      checkinAt: record.checkinAt.toISOString(),
      checkoutAt: record.checkoutAt?.toISOString() || null,
      isActive: record.isActive,
    };
  }
}
