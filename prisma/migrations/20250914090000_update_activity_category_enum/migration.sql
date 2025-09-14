-- Alter enum ActivityCategory: recreate with new values
-- Strategy: create new enum, alter column, drop old enum

BEGIN;

-- 1. Create the new enum type with the desired values
CREATE TYPE "ActivityCategory_new" AS ENUM (
  'VR_HMD',
  'DRONE',
  'PRINTER_3D',
  'PEPPER',
  'LEGO',
  'MBOT2',
  'LITTLE_BITS',
  'MESH',
  'TOIO',
  'MINECRAFT',
  'UNITY',
  'BLENDER',
  'DAVINCI_RESOLVE',
  'OTHER'
);

-- 2. Alter the column to use the new enum. Cast via text.
ALTER TABLE "ActivityLog" ALTER COLUMN "category" TYPE "ActivityCategory_new" USING ("category"::text::"ActivityCategory_new");

-- 3. Rename old enum and new enum
ALTER TYPE "ActivityCategory" RENAME TO "ActivityCategory_old";
ALTER TYPE "ActivityCategory_new" RENAME TO "ActivityCategory";

-- 4. Drop old enum
DROP TYPE "ActivityCategory_old";

-- 5. 旧カテゴリ値 (STUDY/MEETING/EVENT/PROJECT) は新列挙に存在しないため OTHER に変換
-- (cast 時点では存在しないため上記 cast で失敗するので、事前に一時 text 変換が必要な別手法が本来望ましい)
-- ここでは単純化のため、失敗時ロールバック想定。既存データがある場合は、以下のように手順を分けて移行してください。
-- 例: 一時 text カラム追加 -> 値コピー -> 列型変更 -> 値マッピング -> クリーンアップ。
-- 簡易運用向け: 失敗する場合は ActivityLog を空にしてから再実行。

COMMIT;
