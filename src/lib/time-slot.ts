// 30分スロット正規化ユーティリティ (JST)

/**
 * 任意のISO文字列/Dateを受け取り JST で 30分境界 (:00 / :30) に floor した Date (UTC基準) を返す。
 * 入力はISO文字列またはDate。返り値は DB 保存用に UTC Date。
 */
export function floorTo30MinSlotJST(input: string | Date): Date {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) throw new Error("INVALID_DATE");
  // JSTでの各成分を計算
  const jstOffset = 9 * 60; // 分
  const utcMinutes = Math.floor(date.getTime() / 60000);
  const jstTotalMinutes = utcMinutes + jstOffset;
  const floored = Math.floor(jstTotalMinutes / 30) * 30; // 30分単位に切り捨て
  const backUtcMinutes = floored - jstOffset;
  return new Date(backUtcMinutes * 60000);
}

/**
 * 与えられた Date(UTC) を JST の ISO文字列 (ローカル壁時計時刻) で返す補助。
 */
export function toJstIsoString(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60000).toISOString();
}
