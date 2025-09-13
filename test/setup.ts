import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library cleanup
afterEach(() => {
  cleanup();
});

// 環境変数 (必要に応じて追記)
process.env.TZ = "Asia/Tokyo";

// Prisma モックのためのヘルパ (必要なら各テストで上書き)
vi.mock("@/lib/prisma", () => {
  const mock = {
    guest: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    checkinRecord: {
      findMany: vi.fn(),
    },
  };
  return { prisma: mock };
});
