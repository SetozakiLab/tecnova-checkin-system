import { NextRequest } from "next/server";
import { withApiHandler, createSuccessResponse } from "@/lib/api-handler";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 管理画面用ユーザー一覧（最小限: username, role）
export const GET = withApiHandler(
  async (_request: NextRequest) => {
    const users = (await prisma.user.findMany({
      // role フィールドはマイグレーション後に型へ反映されるため any キャスト
      select: { username: true } as any,
      orderBy: { username: "asc" },
    })) as any[];
    // 取得後 role を個別再取得するのは冗長なので、現在は role 未使用の場合そのまま返す
    return createSuccessResponse({ users });
  },
  { requireAuth: false, allowedMethods: ["GET"] }
);
