import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { CheckinService } from "../checkin.service";

// NOTE: テスト簡易モック用 (本番型安全性には影響しない)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface MockedPrisma {
  checkinRecord: any;
}
const mockPrisma = prisma as unknown as MockedPrisma;

describe("CheckinService.getTodayGuests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("重複ゲストを一意にし最初のチェックイン順で返す", async () => {
    const baseTime = new Date("2025-09-14T00:30:00+09:00");
    // today checkins (asc)
    mockPrisma.checkinRecord.findMany
      .mockResolvedValueOnce([
        {
          id: "c1",
          guestId: "g1",
          checkinAt: new Date(baseTime),
          checkoutAt: null,
          guest: { name: "Alice", displayId: 1001, grade: "ES5" },
        },
        {
          id: "c2",
          guestId: "g2",
          checkinAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
          checkoutAt: null,
          guest: { name: "Bob", displayId: 1002, grade: null },
        },
        {
          id: "c3",
          guestId: "g1",
          checkinAt: new Date(baseTime.getTime() + 10 * 60 * 1000),
          checkoutAt: null,
          guest: { name: "Alice", displayId: 1001, grade: "ES5" },
        },
      ])
      // all visits for stats
      .mockResolvedValueOnce([
        { guestId: "g1", checkinAt: new Date(baseTime), checkoutAt: null },
        {
          guestId: "g1",
          checkinAt: new Date(baseTime.getTime() - 86400000),
          checkoutAt: new Date(baseTime.getTime() - 86300000),
        },
        {
          guestId: "g2",
          checkinAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
          checkoutAt: null,
        },
      ]);

    const result = await CheckinService.getTodayGuests();

    expect(result).toHaveLength(2); // g1 と g2 のみ
    expect(result[0].guestId).toBe("g1");
    expect(result[1].guestId).toBe("g2");
    // grade 反映
    const alice = result.find((r) => r.guestId === "g1");
    expect(alice?.guestGrade).toBe("ES5");
    // visits 統計: g1 totalVisitCount >= 2 (前日分含む)
    expect(alice?.totalVisitCount).toBeGreaterThanOrEqual(2);
  });
});
