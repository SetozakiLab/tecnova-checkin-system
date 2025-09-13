import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuestService } from "../guest.service";
import { prisma } from "@/lib/prisma";
import * as dateUtils from "@/lib/date-utils";

// 型補助 (簡易)
interface MockedPrisma {
  guest: any;
  checkinRecord: any;
}

const mockPrisma = prisma as unknown as MockedPrisma;

describe("GuestService.createGuest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("displayId を生成してゲストを作成する", async () => {
    vi.spyOn(dateUtils, "getNextSequenceForYear").mockResolvedValue(5);
    vi.spyOn(dateUtils, "generateDisplayId").mockReturnValue(25005);

    mockPrisma.guest.findUnique.mockResolvedValue(null); // displayId 重複なし
    mockPrisma.guest.create.mockResolvedValue({
      id: "g1",
      displayId: 25005,
      name: "Alice",
      contact: null,
      grade: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    const created = await GuestService.createGuest({
      name: "Alice",
      contact: "",
    });

    expect(created).toEqual({
      id: "g1",
      displayId: 25005,
      name: "Alice",
      contact: null,
      grade: null,
      createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    });

    expect(mockPrisma.guest.create).toHaveBeenCalledWith({
      data: { displayId: 25005, name: "Alice", contact: null, grade: null },
    });
  });

  it("シーケンス上限でエラー", async () => {
    vi.spyOn(dateUtils, "getNextSequenceForYear").mockResolvedValue(1000); // > 999

    await expect(
      GuestService["generateUniqueDisplayId"]?.call(GuestService)
    ).rejects.toThrow("SEQUENCE_LIMIT_EXCEEDED");
  });
});

describe("GuestService.updateGuest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("存在しないIDでエラー", async () => {
    mockPrisma.guest.findUnique.mockResolvedValue(null);
    await expect(
      GuestService.updateGuest("nope", { name: "X" })
    ).rejects.toThrow(/ゲストが見つかりません/);
  });

  it("名前と contact を更新", async () => {
    const base = {
      id: "g2",
      displayId: 12345,
      name: "Bob",
      contact: null,
      grade: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
    };

    mockPrisma.guest.findUnique.mockResolvedValue(base);
    mockPrisma.guest.update.mockResolvedValue({
      ...base,
      name: "Bobby",
      contact: "a@example.com",
    });

    const updated = await GuestService.updateGuest("g2", {
      name: "Bobby",
      contact: "a@example.com",
    });
    expect(updated.name).toBe("Bobby");
    expect(updated.contact).toBe("a@example.com");
  });
});

describe("GuestService grade フィールド", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("grade を指定して作成", async () => {
    vi.spyOn(dateUtils, "getNextSequenceForYear").mockResolvedValue(7);
    vi.spyOn(dateUtils, "generateDisplayId").mockReturnValue(25007);

    mockPrisma.guest.findUnique.mockResolvedValue(null);
    mockPrisma.guest.create.mockResolvedValue({
      id: "g3",
      displayId: 25007,
      name: "Carol",
      contact: null,
      grade: "JH2",
      createdAt: new Date("2025-01-02T00:00:00Z"),
    });

    const created = await GuestService.createGuest({
      name: "Carol",
      contact: "",
      grade: "JH2",
    });

    expect(created.grade).toBe("JH2");
  });

  it("grade を null に更新", async () => {
    const base = {
      id: "g4",
      displayId: 11111,
      name: "Dan",
      contact: null,
      grade: "ES3",
      createdAt: new Date("2025-01-03T00:00:00Z"),
    };

    mockPrisma.guest.findUnique.mockResolvedValue(base);
    mockPrisma.guest.update.mockResolvedValue({
      ...base,
      grade: null,
    });

    const updated = await GuestService.updateGuest("g4", { grade: null });
    expect(updated.grade).toBeNull();
  });
});
