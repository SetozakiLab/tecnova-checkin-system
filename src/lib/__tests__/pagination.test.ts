import { describe, expect, it } from "vitest";
import { buildPagination, coerceLimit, coercePage } from "../pagination";

describe("pagination util", () => {
  it("buildPagination 計算", () => {
    const p = buildPagination(2, 10, 35);
    expect(p.totalPages).toBe(4);
  });
  it("coercePage fallback", () => {
    expect(coercePage("0")).toBe(1);
  });
  it("coerceLimit 上限", () => {
    expect(coerceLimit("500")).toBe(100);
  });
});
