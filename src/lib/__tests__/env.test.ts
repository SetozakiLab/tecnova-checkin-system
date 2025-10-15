import { describe, expect, it } from "vitest";

describe("env schema", () => {
  it("必要な環境変数が存在する場合に読み込める", async () => {
    // 動的 import で既存キャッシュに影響しないようにする
    const original = { ...process.env };
    process.env.DATABASE_URL = "https://example.com";
    process.env.ADMIN_SHARED_PASSWORD = "abcdefgh";
    const mod = await import("../env");
    expect(mod.env.DATABASE_URL).toBe("https://example.com");
    expect(mod.env.ADMIN_SHARED_PASSWORD).toBe("abcdefgh");
    process.env = original;
  });
});
