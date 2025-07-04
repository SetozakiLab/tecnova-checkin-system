import { differenceInMinutes, format } from "date-fns";
import { ja } from "date-fns/locale";

export function generateDisplayId(): number {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return parseInt(`${year}${month}${day}${random}`);
}

export function formatStayDuration(
  checkinAt: Date,
  checkoutAt?: Date | null
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
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy年MM月dd日 HH:mm", { locale: ja });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm", { locale: ja });
}
