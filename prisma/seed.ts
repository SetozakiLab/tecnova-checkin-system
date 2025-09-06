import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 管理者ユーザーの作成
  const hashedPassword = await bcrypt.hash(
    process.env.SUPERUSER_PASSWORD as string,
    10
  );

  const admin = await prisma.user.upsert({
    where: { username: "superuser" },
    update: {},
    create: {
      username: "superuser",
      hashedPassword,
      role: "SUPER",
    } as any,
  });

  console.log({ admin });

  // テスト用ゲストの作成
  const initialGuest = await prisma.guest.upsert({
    where: { displayId: 25001 },
    update: {},
    create: {
      displayId: 25000,
      name: "テッくん",
      contact: "tecnova@example.com",
    },
  });

  console.log({ initialGuest });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
