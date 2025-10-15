import { z } from "zod";
import type { Prisma } from "@/generated/prisma";
import { generateDisplayId, getNextSequenceForYear } from "@/lib/date-utils";
import { domain } from "@/lib/errors";
import { buildPagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { getDateEndJST, getDateStartJST } from "@/lib/timezone";
import type {
  GradeValue,
  GuestData,
  GuestExportRow,
  PaginationData,
} from "@/types/api";

const gradeEnumValues = [
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
] as const;

const gradeEnum = z.enum(gradeEnumValues);

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
  grade: gradeEnum.optional().nullable(),
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
  grade: gradeEnum.optional().nullable(),
});

export const guestSearchSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CreateGuestData = z.infer<typeof createGuestSchema>;
export type UpdateGuestData = z.infer<typeof updateGuestSchema>;
export type GuestSearchParams = z.infer<typeof guestSearchSchema>;

export type GuestExportStatus = "ALL" | "CHECKED_IN" | "CHECKED_OUT";

export interface GuestExportParams {
  keyword?: string;
  grades?: GradeValue[];
  status?: GuestExportStatus;
  registeredStart?: string;
  registeredEnd?: string;
  minTotalVisits?: number;
  includeVisitStats?: boolean;
}

// ゲストサービスクラス
export class GuestService {
  // ゲスト作成
  static async createGuest(data: CreateGuestData): Promise<GuestData> {
    // ユニークなdisplayIdを生成
    const displayId = await GuestService.generateUniqueDisplayId();

    const guest = await prisma.guest.create({
      data: {
        displayId,
        name: data.name,
        contact: data.contact || null,
        grade: data.grade || null,
      },
    });

    return GuestService.formatGuestData(guest);
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
      ...GuestService.formatGuestData(guest),
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      currentCheckinId: guest.checkins[0]?.id || null,
      lastCheckinAt: guest.checkins[0]?.checkinAt.toISOString() || null,
    };
  }

  // ゲスト更新
  static async updateGuest(
    id: string,
    data: UpdateGuestData,
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

    return GuestService.formatGuestData(updatedGuest);
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
        whereConditions.displayId = parseInt(search, 10);
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
      lastVisits.map((lv) => [lv.guestId, lv.checkoutAt]),
    );

    const guestsData: GuestData[] = guests.map((guest) => ({
      ...GuestService.formatGuestData(guest),
      isCurrentlyCheckedIn: guest.checkins.length > 0,
      totalVisits: guest._count.checkins,
      lastVisitAt: lastVisitMap.get(guest.id)?.toISOString() || null,
    }));

    const pagination: PaginationData = buildPagination(page, limit, totalCount);

    return { guests: guestsData, pagination };
  }

  static async exportGuests(
    params: GuestExportParams,
  ): Promise<GuestExportRow[]> {
    const {
      keyword,
      grades,
      status = "ALL",
      registeredStart,
      registeredEnd,
      minTotalVisits,
      includeVisitStats,
    } = params;

    const filters: Prisma.GuestWhereInput[] = [];

    if (grades && grades.length > 0) {
      filters.push({ grade: { in: grades } });
    }

    if (registeredStart || registeredEnd) {
      const range: Prisma.DateTimeFilter = {};
      if (registeredStart) {
        range.gte = getDateStartJST(registeredStart);
      }
      if (registeredEnd) {
        range.lte = getDateEndJST(registeredEnd);
      }
      filters.push({ createdAt: range });
    }

    if (status === "CHECKED_IN") {
      filters.push({ checkins: { some: { isActive: true } } });
    } else if (status === "CHECKED_OUT") {
      filters.push({ checkins: { none: { isActive: true } } });
    }

    if (keyword?.trim()) {
      const term = keyword.trim();
      const isNumeric = /^\d+$/.test(term);
      if (isNumeric) {
        const displayId = Number.parseInt(term, 10);
        if (!Number.isNaN(displayId)) {
          filters.push({ displayId });
        }
      } else {
        filters.push({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { contact: { contains: term, mode: "insensitive" } },
          ],
        });
      }
    }

    const where: Prisma.GuestWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const guests = await prisma.guest.findMany({
      where,
      include: {
        checkins: {
          where: { isActive: true },
          select: { id: true },
        },
        _count: {
          select: { checkins: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const filteredGuests =
      typeof minTotalVisits === "number"
        ? guests.filter(
            (guest) => (guest._count?.checkins ?? 0) >= minTotalVisits,
          )
        : guests;

    const guestIds = filteredGuests.map((guest) => guest.id);
    const statsMap = new Map<
      string,
      { lastVisitAt: string | null; totalStayMinutes: number }
    >();

    if (includeVisitStats && guestIds.length > 0) {
      const checkins = await prisma.checkinRecord.findMany({
        where: { guestId: { in: guestIds } },
        select: { guestId: true, checkinAt: true, checkoutAt: true },
        orderBy: { checkinAt: "asc" },
      });
      const now = new Date();
      for (const record of checkins) {
        const current = statsMap.get(record.guestId) ?? {
          lastVisitAt: null as string | null,
          totalStayMinutes: 0,
        };
        const end = record.checkoutAt ?? now;
        const minutes = Math.max(
          0,
          Math.floor(
            (end.getTime() - record.checkinAt.getTime()) / (1000 * 60),
          ),
        );
        current.totalStayMinutes += minutes;
        const candidate = record.checkoutAt ?? record.checkinAt;
        if (!current.lastVisitAt || candidate > new Date(current.lastVisitAt)) {
          current.lastVisitAt = candidate.toISOString();
        }
        statsMap.set(record.guestId, current);
      }
    }

    return filteredGuests.map((guest) => {
      const stats = statsMap.get(guest.id);
      return {
        id: guest.id,
        displayId: guest.displayId,
        name: guest.name,
        contact: guest.contact ?? null,
        grade: guest.grade ?? null,
        createdAt: guest.createdAt.toISOString(),
        isCurrentlyCheckedIn: guest.checkins.length > 0,
        totalVisits: guest._count?.checkins ?? 0,
        lastVisitAt: includeVisitStats ? (stats?.lastVisitAt ?? null) : null,
        totalStayMinutes: includeVisitStats
          ? (stats?.totalStayMinutes ?? 0)
          : null,
      } satisfies GuestExportRow;
    });
  }

  // ゲスト検索（公開用 - display IDまたは名前）
  static async searchGuestsPublic(query: string): Promise<GuestData[]> {
    const isNumeric = /^\d+$/.test(query);

    const whereConditions: {
      displayId?: number;
      name?: { contains: string; mode: "insensitive" };
    } = {};

    if (isNumeric) {
      // 数値の場合はdisplayIdで検索
      whereConditions.displayId = parseInt(query, 10);
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
      ...GuestService.formatGuestData(guest),
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
