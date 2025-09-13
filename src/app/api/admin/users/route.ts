import { withApiHandler, createSuccessResponse } from "@/lib/api-handler";
import { PrismaClient, type User } from "@/generated/prisma";

const prisma = new PrismaClient();

// 管理画面用ユーザー一覧（最小限: username, role）
export const GET = withApiHandler(
  async () => {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
      orderBy: { username: "asc" },
    });
    return createSuccessResponse<{
      users: Pick<User, "id" | "username" | "role">[];
    }>({ users });
  },
  { requireAuth: true, allowedMethods: ["GET"] }
);
