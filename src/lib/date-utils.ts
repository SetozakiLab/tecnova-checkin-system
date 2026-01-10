import { differenceInMinutes } from "date-fns";
import { prisma } from "./prisma";
import { formatJSTDateTime, formatJSTTime, nowInJST } from "./timezone";

/**
 * 与えられた日付から年度を計算します
 * 4月～12月は当年度、1月～3月は前年度
 * @param date - 対象日付（デフォルトは現在）
 * @returns 年度の下2桁（例：25は2025年度）
 */
export function getAcademicYear(date: Date = nowInJST()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth()は0-11なので+1

  // 1月～3月は前年度
  if (month < 4) {
    return (year - 1).toString().slice(-2);
  }

  // 4月～12月は当年度
  return year.toString().slice(-2);
}

export function generateDisplayId(sequence: number): number {
  const now = nowInJST();
  const yearCode = getAcademicYear(now);
  const sequenceStr = sequence.toString().padStart(3, "0");

  return parseInt(`${yearCode}${sequenceStr}`, 10);
}

export async function getNextSequenceForYear(year?: number): Promise<number> {
  // 年度コードを取得
  let academicYearCode: string;
  if (year) {
    academicYearCode = year.toString().slice(-2);
  } else {
    academicYearCode = getAcademicYear();
  }

  const yearCodeNum = parseInt(academicYearCode, 10);
  const nextYearCode = ((yearCodeNum + 1) % 100).toString().padStart(2, "0");

  // 該当年度のdisplayIdの最大値を取得
  const maxDisplayId = await prisma.guest.findFirst({
    where: {
      displayId: {
        gte: parseInt(`${academicYearCode}000`, 10),
        lt: parseInt(`${nextYearCode}000`, 10),
      },
    },
    orderBy: {
      displayId: "desc",
    },
  });

  if (!maxDisplayId) {
    return 1; // 該当年度の最初のゲスト
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
