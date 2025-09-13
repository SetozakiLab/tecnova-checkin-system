import { z } from "zod";

/**
 * 実行時環境変数スキーマ定義
 * - サーバーサイドのみで読み込むことを想定
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL が不正です"),
  ADMIN_SHARED_PASSWORD: z
    .string()
    .min(8, "ADMIN_SHARED_PASSWORD は8文字以上")
    .optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET は32文字以上")
    .optional(),
});

/**
 * 環境変数のパース
 * 失敗時は詳細なZodエラーを throw
 */
export const env = (() => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`環境変数の検証に失敗しました:\n${formatted}`);
  }
  return parsed.data;
})();

export type AppEnv = typeof env;
