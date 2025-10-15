// Infrastructure: Guest Repository Implementation
// Prismaを使用したゲストリポジトリの実装

import type { GuestEntity, GuestWithStatus } from "@/domain/entities/guest";
import type {
  CreateGuestParams,
  GuestSearchParams,
  GuestSearchResult,
  IGuestRepository,
  UpdateGuestParams,
} from "@/domain/repositories/guest-repository";
import type { GradeValue } from "@/domain/value-objects/grade";
import type { Prisma } from "@/generated/prisma";
import { generateDisplayId, getNextSequenceForYear } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

export class PrismaGuestRepository implements IGuestRepository {
  async findById(id: string): Promise<GuestEntity | null> {
    const guest = await prisma.guest.findUnique({
      where: { id },
    });

    if (!guest) return null;

    return this.mapToEntity(guest);
  }

  async findByIdWithStatus(id: string): Promise<GuestWithStatus | null> {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        checkins: {
          where: { isActive: true },
          orderBy: { checkinAt: "desc" },
          take: 1,
        },
        _count: {
          select: { checkins: true },
        },
      },
    });

    if (!guest) return null;

    // 最後の来場日時を取得
    const lastCheckin = await prisma.checkinRecord.findFirst({
      where: { guestId: id },
      orderBy: { checkinAt: "desc" },
    });

    const isCurrentlyCheckedIn = guest.checkins.length > 0;
    const currentCheckinId = isCurrentlyCheckedIn ? guest.checkins[0].id : null;

    return {
      ...this.mapToEntity(guest),
      isCurrentlyCheckedIn,
      currentCheckinId,
      lastCheckinAt: lastCheckin?.checkinAt || null,
      totalVisits: guest._count.checkins,
      lastVisitAt: lastCheckin?.checkinAt || null,
    };
  }

  async findByDisplayId(displayId: number): Promise<GuestEntity | null> {
    const guest = await prisma.guest.findUnique({
      where: { displayId },
    });

    if (!guest) return null;

    return this.mapToEntity(guest);
  }

  async findByName(name: string): Promise<GuestEntity[]> {
    const guests = await prisma.guest.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      orderBy: { displayId: "desc" },
      take: 10, // 検索結果を制限
    });

    return guests.map((guest) => this.mapToEntity(guest));
  }

  async search(params: GuestSearchParams): Promise<GuestSearchResult> {
    const { page, limit, name, grade, isCheckedIn } = params;
    const skip = (page - 1) * limit;

    // WHERE条件を構築
    const where: Prisma.GuestWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (grade) {
      where.grade = grade;
    }

    if (isCheckedIn !== undefined) {
      if (isCheckedIn) {
        where.checkins = {
          some: { isActive: true },
        };
      } else {
        where.NOT = {
          checkins: {
            some: { isActive: true },
          },
        };
      }
    }

    // 総数とデータを並行取得
    const [totalCount, guests] = await Promise.all([
      prisma.guest.count({ where }),
      prisma.guest.findMany({
        where,
        include: {
          checkins: {
            where: { isActive: true },
            take: 1,
          },
          _count: {
            select: { checkins: true },
          },
        },
        orderBy: { displayId: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const guestsWithStatus: GuestWithStatus[] = await Promise.all(
      guests.map(async (guest) => {
        const lastCheckin = await prisma.checkinRecord.findFirst({
          where: { guestId: guest.id },
          orderBy: { checkinAt: "desc" },
        });

        const isCurrentlyCheckedIn = guest.checkins.length > 0;
        const currentCheckinId = isCurrentlyCheckedIn
          ? guest.checkins[0].id
          : null;

        return {
          ...this.mapToEntity(guest),
          isCurrentlyCheckedIn,
          currentCheckinId,
          lastCheckinAt: lastCheckin?.checkinAt || null,
          totalVisits: guest._count.checkins,
          lastVisitAt: lastCheckin?.checkinAt || null,
        };
      }),
    );

    return {
      guests: guestsWithStatus,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findCurrentlyCheckedIn(): Promise<GuestWithStatus[]> {
    const guests = await prisma.guest.findMany({
      where: {
        checkins: {
          some: { isActive: true },
        },
      },
      include: {
        checkins: {
          where: { isActive: true },
          take: 1,
          orderBy: { checkinAt: "desc" },
        },
        _count: {
          select: { checkins: true },
        },
      },
      orderBy: { displayId: "desc" },
    });

    return await Promise.all(
      guests.map(async (guest) => {
        const lastCheckin = await prisma.checkinRecord.findFirst({
          where: { guestId: guest.id },
          orderBy: { checkinAt: "desc" },
        });

        return {
          ...this.mapToEntity(guest),
          isCurrentlyCheckedIn: true,
          currentCheckinId: guest.checkins[0]?.id || null,
          lastCheckinAt: lastCheckin?.checkinAt || null,
          totalVisits: guest._count.checkins,
          lastVisitAt: lastCheckin?.checkinAt || null,
        };
      }),
    );
  }

  async create(params: CreateGuestParams): Promise<GuestEntity> {
    const displayId = await this.getNextDisplayId();

    const guest = await prisma.guest.create({
      data: {
        displayId,
        name: params.name,
        contact: params.contact || null,
        grade: params.grade || null,
      },
    });

    return this.mapToEntity(guest);
  }

  async update(id: string, params: UpdateGuestParams): Promise<GuestEntity> {
    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name: params.name,
        contact: params.contact,
        grade: params.grade,
      },
    });

    return this.mapToEntity(guest);
  }

  async delete(id: string): Promise<void> {
    await prisma.guest.delete({
      where: { id },
    });
  }

  async getNextDisplayId(): Promise<number> {
    const seq = await getNextSequenceForYear();
    return generateDisplayId(seq);
  }

  async getTotalCount(): Promise<number> {
    return prisma.guest.count();
  }

  private mapToEntity(guest: {
    id: string;
    displayId: number;
    name: string;
    contact: string | null;
    grade: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): GuestEntity {
    const createdAt =
      typeof guest.createdAt === "string"
        ? new Date(guest.createdAt)
        : guest.createdAt;
    const updatedAt =
      typeof guest.updatedAt === "string"
        ? new Date(guest.updatedAt)
        : guest.updatedAt;
    return {
      id: guest.id,
      displayId: guest.displayId,
      name: guest.name,
      contact: guest.contact,
      grade: guest.grade as GradeValue | null,
      createdAt,
      updatedAt,
    };
  }
}
