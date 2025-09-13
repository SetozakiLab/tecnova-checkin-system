import { describe, it, expect } from "vitest";
import { PrismaCheckinRecordRepository } from "@/infrastructure/repositories/prisma-checkin-record-repository";

// ここではリポジトリのインターフェース形状テスト(簡易) - 実 DB 依存するためモック/スキップ想定

describe("PrismaCheckinRecordRepository guest stats shape", () => {
  it("exposes getGuestDailyStats & getGuestDetailStats", () => {
    const repo = new PrismaCheckinRecordRepository();
    expect(typeof repo.getGuestDailyStats).toBe("function");
    expect(typeof repo.getGuestDetailStats).toBe("function");
  });
});
