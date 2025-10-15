import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatStayDuration, generateDisplayId } from "../date-utils";
import * as timezone from "../timezone";

// nowInJST を安定化
beforeEach(() => {
  vi.spyOn(timezone, "nowInJST").mockReturnValue(
    new Date("2025-01-15T00:00:00+09:00"),
  );
});

describe("generateDisplayId", () => {
  it("シーケンス番号を3桁ゼロ埋めし 下2桁の年を先頭に結合する", () => {
    const id = generateDisplayId(7);
    // 2025年 => '25' + '007'
    expect(id).toBe(25007);
  });
});

describe("formatStayDuration", () => {
  it("同一時間内の分のみ", () => {
    const start = new Date("2025-01-01T10:00:00+09:00");
    const end = new Date("2025-01-01T10:25:00+09:00");
    expect(formatStayDuration(start, end)).toBe("25分");
  });

  it("ぴったり1時間", () => {
    const start = new Date("2025-01-01T10:00:00+09:00");
    const end = new Date("2025-01-01T11:00:00+09:00");
    expect(formatStayDuration(start, end)).toBe("1時間");
  });

  it("複合 (1時間30分)", () => {
    const start = new Date("2025-01-01T10:00:00+09:00");
    const end = new Date("2025-01-01T11:30:00+09:00");
    expect(formatStayDuration(start, end)).toBe("1時間30分");
  });
});
