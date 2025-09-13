import { prisma } from "@/lib/prisma";
import { generateDisplayId, getNextSequenceForYear } from "@/lib/date-utils";
import { GuestData, PaginationData } from "@/types/api";
import { buildPagination } from "@/lib/pagination";
import { domain } from "@/lib/errors";
import { z } from "zod";

// Zodスキーマ
export const createGuestSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(50, "名前は50文字以内で入力してください"),
  contact: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),
  grade: z
    .enum([
      "ES1",
      "ES2",
      "ES3",
      "ES4",
      "ES5",
      "ES6",
      "JH1",
      "JH2",
      "JH3",
      "HS1",
      "HS2",
      "HS3",
    ] as const)
    .optional()
    .nullable(),
});

export const updateGuestSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(50, "名前は50文字以内で入力してください")
    .optional(),
  contact: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),
  grade: z
    .enum([
      "ES1",
      "ES2",
      "ES3",
      "ES4",
      "ES5",
      "ES6",
      "JH1",
      "JH2",
      "JH3",
      "HS1",
      "HS2",
      "HS3",
    ] as const)
    .optional()
    .nullable(),
});

export const guestSearchSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CreateGuestData = z.infer<typeof createGuestSchema>;
export type UpdateGuestData = z.infer<typeof updateGuestSchema>;
export type GuestSearchParams = z.infer<typeof guestSearchSchema>;

// ゲストサービスクラス
export class GuestService {
  // ゲスト作成
  static async createGuest(data: CreateGuestData): Promise<GuestData> {
    // ユニークなdisplayIdを生成
    const displayId = await this.generateUniqueDisplayId();

    const guest = await prisma.guest.create({
      data: {
        displayId,
        name: data.name,
        contact: data.contact || null,
        grade: data.grade || null,
      },
    });

    return this.formatGuestData(guest);
  }

  // ゲスト取得（ID）
  static async getGuestById(id: string): Promise<GuestData | null> {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!guest) return null;

    return {
      ...this.formatGuestData(guest),
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      currentCheckinId: guest.checkins[0]?.id || null,
      lastCheckinAt: guest.checkins[0]?.checkinAt.toISOString() || null,
    };
  }

  // ゲスト更新
  static async updateGuest(
    id: string,
    data: UpdateGuestData
  ): Promise<GuestData> {
    const guest = await prisma.guest.findUnique({ where: { id } });
    if (!guest) throw domain("GUEST_NOT_FOUND");

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.contact !== undefined && { contact: data.contact || null }),
        ...(data.grade !== undefined && { grade: data.grade || null }),
      },
    });

    return this.formatGuestData(updatedGuest);
  }

  // ゲスト削除
  static async deleteGuest(id: string): Promise<void> {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!guest) throw domain("GUEST_NOT_FOUND");

    if (guest.checkins.length > 0) throw domain("GUEST_CURRENTLY_CHECKED_IN");

    await prisma.guest.delete({ where: { id } });
  }

  // ゲスト検索（管理者用）
  static async searchGuests(params: GuestSearchParams): Promise<{
    guests: GuestData[];
    pagination: PaginationData;
  }> {
    const { search, page, limit } = params;

    // 検索条件の構築
    const whereConditions: {
      displayId?: number;
      name?: { contains: string; mode: "insensitive" };
    } = {};

    if (search) {
      const isNumeric = /^\d+$/.test(search);
      if (isNumeric) {
        whereConditions.displayId = parseInt(search);
      } else {
        whereConditions.name = {
          contains: search,
          mode: "insensitive",
        };
      }
    }

    // 総件数取得
    const totalCount = await prisma.guest.count({
      where: whereConditions,
    });

    // ゲスト取得
    const guests = await prisma.guest.findMany({
      where: whereConditions,
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
        _count: {
          select: { checkins: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 最後の訪問日時を取得（別途クエリ）
    const guestIds = guests.map((g) => g.id);
    const lastVisits = await prisma.checkinRecord.findMany({
      where: {
        guestId: { in: guestIds },
        checkoutAt: { not: null },
      },
      select: {
        guestId: true,
        checkoutAt: true,
      },
      orderBy: {
        checkoutAt: "desc",
      },
      distinct: ["guestId"],
    });

    const lastVisitMap = new Map(
      lastVisits.map((lv) => [lv.guestId, lv.checkoutAt])
    );

    const guestsData: GuestData[] = guests.map((guest) => ({
      ...this.formatGuestData(guest),
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      totalVisits: guest._count.checkins,
      lastVisitAt: lastVisitMap.get(guest.id)?.toISOString() || null,
    }));

    const pagination: PaginationData = buildPagination(page, limit, totalCount);

    return { guests: guestsData, pagination };
  }

  // ゲスト検索（公開用 - display IDまたは名前）
  static async searchGuestsPublic(query: string): Promise<GuestData[]> {
    const isNumeric = /^\d+$/.test(query);

    let whereConditions: {
      displayId?: number;
      name?: { contains: string; mode: "insensitive" };
    } = {};

    if (isNumeric) {
      // 数値の場合はdisplayIdで検索
      whereConditions.displayId = parseInt(query);
    } else {
      // 文字列の場合は名前で検索
      whereConditions.name = {
        contains: query,
        mode: "insensitive",
      };
    }

    const guests = await prisma.guest.findMany({
      where: whereConditions,
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
        },
      },
      take: 10, // 検索結果は10件まで
    });

    return guests.map((guest) => ({
      ...this.formatGuestData(guest),
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      currentCheckinId: guest.checkins[0]?.id || null,
      lastCheckinAt: guest.checkins[0]?.checkinAt.toISOString() || null,
    }));
  }

  // ユニークなdisplayIdを生成
  private static async generateUniqueDisplayId(): Promise<number> {
    const currentYear = new Date().getFullYear();
    const sequence = await getNextSequenceForYear(currentYear);

    if (sequence > 999) {
      throw new Error("SEQUENCE_LIMIT_EXCEEDED");
    }

    const displayId = generateDisplayId(sequence);

    // 念のため、生成されたdisplayIdが既に存在しないかチェック
    const existingDisplayId = await prisma.guest.findUnique({
      where: { displayId },
    });

    if (existingDisplayId) {
      throw new Error("DISPLAY_ID_GENERATION_FAILED");
    }

    return displayId;
  }

  // ゲストデータのフォーマット
  private static formatGuestData(guest: {
    id: string;
    displayId: number;
    name: string;
    contact: string | null;
    grade: string | null;
    createdAt: Date;
  }): GuestData {
    return {
      id: guest.id,
      displayId: guest.displayId,
      name: guest.name,
      contact: guest.contact,
      grade: guest.grade ?? null,
      createdAt: guest.createdAt.toISOString(),
    };
  }
}
