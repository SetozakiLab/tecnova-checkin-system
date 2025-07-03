import { z } from "zod";

// ゲスト登録用のスキーマ
export const guestRegistrationSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),
  contact: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),
});

// ゲスト検索用のスキーマ
export const guestSearchSchema = z.object({
  q: z.string().min(1, "検索語は必須です"),
  limit: z.number().min(1).max(50).optional().default(10),
});

// チェックイン/アウト用のスキーマ
export const checkinSchema = z.object({
  timestamp: z.string().datetime().optional(),
});

// 管理者用ゲスト更新スキーマ
export const adminGuestUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),
  contact: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),
});

// 管理者用履歴検索スキーマ
export const adminHistorySearchSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  guestName: z.string().optional(),
  type: z.enum(["checkin", "checkout"]).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(50),
});

// 管理者用ゲスト検索スキーマ
export const adminGuestSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(50),
});

// 型定義
export type GuestRegistration = z.infer<typeof guestRegistrationSchema>;
export type GuestSearch = z.infer<typeof guestSearchSchema>;
export type CheckinRequest = z.infer<typeof checkinSchema>;
export type AdminGuestUpdate = z.infer<typeof adminGuestUpdateSchema>;
export type AdminHistorySearch = z.infer<typeof adminHistorySearchSchema>;
export type AdminGuestSearch = z.infer<typeof adminGuestSearchSchema>;
