// 共通 ActivityCategory 定義と表示用ユーティリティ
// Prisma enum と同期させること

export const ACTIVITY_CATEGORIES = [
  "VR_HMD",
  "DRONE",
  "PRINTER_3D",
  "PEPPER",
  "LEGO",
  "MBOT2",
  "LITTLE_BITS",
  "MESH",
  "TOIO",
  "MINECRAFT",
  "UNITY",
  "BLENDER",
  "DAVINCI_RESOLVE",
  "OTHER",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  VR_HMD: "VR（HMD）",
  DRONE: "ドローン",
  PRINTER_3D: "3D プリンタ",
  PEPPER: "ペッパー",
  LEGO: "レゴ",
  MBOT2: "mBot2",
  LITTLE_BITS: "little Bits",
  MESH: "MESH",
  TOIO: "toio",
  MINECRAFT: "マインクラフト",
  UNITY: "Unity",
  BLENDER: "Blender",
  DAVINCI_RESOLVE: "DaVinci Resolve",
  OTHER: "その他",
};

// カテゴリごとの色 (shadcn / tailwind のユーティリティクラス)
export const activityCategoryColorClasses: Record<ActivityCategory, string> = {
  VR_HMD: "bg-purple-500/15 text-purple-600 border-purple-400/40",
  DRONE: "bg-sky-500/15 text-sky-600 border-sky-400/40",
  PRINTER_3D: "bg-orange-500/15 text-orange-600 border-orange-400/40",
  PEPPER: "bg-rose-500/15 text-rose-600 border-rose-400/40",
  LEGO: "bg-yellow-500/20 text-yellow-700 border-yellow-400/40",
  MBOT2: "bg-cyan-500/15 text-cyan-600 border-cyan-400/40",
  LITTLE_BITS: "bg-pink-500/15 text-pink-600 border-pink-400/40",
  MESH: "bg-emerald-500/15 text-emerald-600 border-emerald-400/40",
  TOIO: "bg-indigo-500/15 text-indigo-600 border-indigo-400/40",
  MINECRAFT: "bg-green-600/15 text-green-700 border-green-500/40",
  UNITY: "bg-gray-500/15 text-gray-600 border-gray-400/40",
  BLENDER: "bg-amber-500/15 text-amber-600 border-amber-400/40",
  DAVINCI_RESOLVE: "bg-blue-600/15 text-blue-700 border-blue-500/40",
  OTHER: "bg-muted text-muted-foreground border-border",
};

export function formatActivityCategory(cat: ActivityCategory) {
  return activityCategoryLabels[cat] ?? cat;
}

export function isActivityCategory(v: string): v is ActivityCategory {
  // 型安全な判定
  return (ACTIVITY_CATEGORIES as readonly string[]).includes(v);
}
