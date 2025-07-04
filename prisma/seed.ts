import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 管理者ユーザーの作成
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      hashedPassword,
    },
  });

  console.log({ admin });

  // テスト用ゲストの作成
  const guest1 = await prisma.guest.upsert({
    where: { displayId: 250704001 },
    update: {},
    create: {
      displayId: 250704001,
      name: "田中太郎",
      contact: "taro@example.com",
    },
  });

  const guest2 = await prisma.guest.upsert({
    where: { displayId: 250704002 },
    update: {},
    create: {
      displayId: 250704002,
      name: "佐藤花子",
    },
  });

  console.log({ guest1, guest2 });
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
