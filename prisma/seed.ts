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
    where: { displayId: 25001 },
    update: {},
    create: {
      displayId: 25001,
      name: "田中太郎",
      contact: "taro@example.com",
    },
  });

  const guest2 = await prisma.guest.upsert({
    where: { displayId: 25002 },
    update: {},
    create: {
      displayId: 25002,
      name: "佐藤花子",
    },
  });

  const guest3 = await prisma.guest.upsert({
    where: { displayId: 25003 },
    update: {},
    create: {
      displayId: 25003,
      name: "山田次郎",
      contact: "jiro@example.com",
    },
  });

  console.log({ guest1, guest2, guest3 });
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
