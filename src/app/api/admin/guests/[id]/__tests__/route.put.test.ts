import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PUT } from "../route";

// getServerSession をモック
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() =>
    Promise.resolve({ user: { id: "u1", role: "MANAGER" } }),
  ),
}));

// GuestService をモック
vi.mock("@/services/guest.service", () => ({
  GuestService: {
    updateGuest: vi.fn(async (_id: string, data: any) => ({
      id: "g1",
      displayId: 12345,
      name: data.name,
      contact: data.contact || null,
      grade: data.grade ?? null,
      createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    })),
  },
  updateGuestSchema: { parse: (v: any) => v },
}));

// バリデーションヘルパーをバイパスするために api-handler の validateRequest を直接使わず JSON をそのまま通るようモック
vi.mock("@/lib/api-handler", async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    validateRequest: () => async (req: NextRequest) => ({
      data: await req.json(),
    }),
  };
});

function buildRequest(body: any) {
  return new NextRequest("http://localhost/api/admin/guests/g1", {
    method: "PUT",
    body: JSON.stringify(body),
  } as any);
}

describe("PUT /api/admin/guests/[id] MANAGER grade 更新", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("MANAGER が grade を更新できる", async () => {
    const res = await PUT(
      buildRequest({ name: "Alice", contact: "", grade: "JH2" }),
      { params: { id: "g1" } },
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.grade).toBe("JH2");
  });
});
