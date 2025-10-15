import { ja } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

/**
 * アプリケーション全体で使用するタイムゾーン
 */
export const APP_TIMEZONE = "Asia/Tokyo";

/**
 * 現在のJSTタイムゾーンでの日時を取得
 */
export function nowInJST(): Date {
  return toZonedTime(new Date(), APP_TIMEZONE);
}

/**
 * 指定された日時をJSTタイムゾーンに変換
 */
export function toJST(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return toZonedTime(dateObj, APP_TIMEZONE);
}

/**
 * JST日時をUTCに変換（データベース保存用）
 */
export function fromJST(date: Date): Date {
  return fromZonedTime(date, APP_TIMEZONE);
}

/**
 * JST日時をISO文字列として取得
 */
export function toJSTISOString(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return toZonedTime(dateObj, APP_TIMEZONE).toISOString();
}

/**
 * 日時をJSTで表示用にフォーマット
 */
export function formatJST(date: Date | string, formatStr: string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, APP_TIMEZONE, formatStr, { locale: ja });
}

/**
 * 日時をJSTで表示用にフォーマット（デフォルト形式）
 */
export function formatJSTDateTime(date: Date | string): string {
  return formatJST(date, "yyyy年MM月dd日 HH:mm");
}

/**
 * 時刻をJSTで表示用にフォーマット
 */
export function formatJSTTime(date: Date | string): string {
  return formatJST(date, "HH:mm");
}

/**
 * 今日の開始時刻（JST 00:00:00）をUTCで取得
 */
export function getTodayStartJST(): Date {
  const now = nowInJST();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  return fromJST(startOfDay);
}

/**
 * 今日の終了時刻（JST 23:59:59.999）をUTCで取得
 */
export function getTodayEndJST(): Date {
  const now = nowInJST();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  return fromJST(endOfDay);
}

/**
 * 明日の開始時刻（JST 00:00:00）をUTCで取得
 */
export function getTomorrowStartJST(): Date {
  const now = nowInJST();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return fromJST(tomorrow);
}

/**
 * 指定された日付の開始時刻（JST 00:00:00）をUTCで取得
 */
export function getDateStartJST(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const jstDate = toJST(dateObj);
  const startOfDay = new Date(
    jstDate.getFullYear(),
    jstDate.getMonth(),
    jstDate.getDate(),
    0,
    0,
    0,
    0,
  );
  return fromJST(startOfDay);
}

/**
 * 指定された日付の終了時刻（JST 23:59:59.999）をUTCで取得
 */
export function getDateEndJST(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const jstDate = toJST(dateObj);
  const endOfDay = new Date(
    jstDate.getFullYear(),
    jstDate.getMonth(),
    jstDate.getDate(),
    23,
    59,
    59,
    999,
  );
  return fromJST(endOfDay);
}
