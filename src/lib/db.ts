import { PrismaClient } from "@/generated/prisma";

// グローバルなPrismaクライアントインスタンスを作成
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 開発環境では複数のPrismaClientインスタンスが作成されるのを防ぐ
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// displayId生成用のヘルパー関数
export const generateDisplayId = async (
  date: Date = new Date()
): Promise<number> => {
  const year = date.getFullYear().toString().slice(-2); // YY
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // MM
  const day = date.getDate().toString().padStart(2, "0"); // DD

  // その日の最大連番を取得
  const datePrefix = `${year}${month}${day}`;
  const maxGuest = await prisma.guest.findFirst({
    where: {
      displayId: {
        gte: parseInt(`${datePrefix}000`),
        lt: parseInt(`${datePrefix}999`) + 1,
      },
    },
    orderBy: {
      displayId: "desc",
    },
  });

  let sequence = 1;
  if (maxGuest) {
    const currentSequence = maxGuest.displayId % 1000;
    sequence = currentSequence + 1;
  }

  const sequenceStr = sequence.toString().padStart(3, "0");
  return parseInt(`${datePrefix}${sequenceStr}`);
};

// チェックイン中のゲストかどうかをチェック
export const isGuestCheckedIn = async (guestId: string): Promise<boolean> => {
  const activeCheckin = await prisma.checkinRecord.findFirst({
    where: {
      guestId,
      isActive: true,
    },
  });
  return !!activeCheckin;
};

// 滞在時間を計算するヘルパー関数
export const calculateStayDuration = (
  checkinAt: Date,
  checkoutAt: Date
): string => {
  const diff = checkoutAt.getTime() - checkinAt.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  } else {
    return `${minutes}分`;
  }
};

// 現在の滞在時間を計算
export const calculateCurrentStayDuration = (checkinAt: Date): string => {
  return calculateStayDuration(checkinAt, new Date());
};
