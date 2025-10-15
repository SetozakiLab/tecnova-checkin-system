import { differenceInMinutes } from "date-fns";
import { prisma } from "./prisma";
import { formatJSTDateTime, formatJSTTime, nowInJST } from "./timezone";

export function generateDisplayId(sequence: number): number {
  const now = nowInJST();
  const year = now.getFullYear().toString().slice(-2);
  const sequenceStr = sequence.toString().padStart(3, "0");

  return parseInt(`${year}${sequenceStr}`, 10);
}

export async function getNextSequenceForYear(year?: number): Promise<number> {
  const targetYear = year || nowInJST().getFullYear();
  const yearPrefix = targetYear.toString().slice(-2);

  // 該当年のdisplayIdの最大値を取得
  const maxDisplayId = await prisma.guest.findFirst({
    where: {
      displayId: {
        gte: parseInt(`${yearPrefix}000`, 10),
        lt: parseInt(
          `${(parseInt(yearPrefix, 10) + 1).toString().padStart(2, "0")}000`,
          10,
        ),
      },
    },
    orderBy: {
      displayId: "desc",
    },
  });

  if (!maxDisplayId) {
    return 1; // 該当年の最初のゲスト
  }

  // 現在の最大displayIdから連番部分を抽出
  const currentSequence = maxDisplayId.displayId % 1000;
  return currentSequence + 1;
}

export function formatStayDuration(
  checkinAt: Date,
  checkoutAt?: Date | null,
): string {
  const endTime = checkoutAt || new Date();
  const minutes = differenceInMinutes(endTime, checkinAt);

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}分`;
  } else if (remainingMinutes === 0) {
    return `${hours}時間`;
  } else {
    return `${hours}時間${remainingMinutes}分`;
  }
}

export function formatDateTime(date: Date | string): string {
  return formatJSTDateTime(date);
}

export function formatTime(date: Date | string): string {
  return formatJSTTime(date);
}
