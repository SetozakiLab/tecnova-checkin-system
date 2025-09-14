-- Manual migration: transform ActivityLog -> activity_log with multi categories and mentorNote
BEGIN;

-- 1. Rename table (preserve data)
ALTER TABLE "ActivityLog" RENAME TO "activity_log";

-- 2. Drop unique index & recreate later if name changed implicitly
-- (Prisma previously created constraint "ActivityLog_guestId_timeslotStart_key")
ALTER TABLE "activity_log" DROP CONSTRAINT IF EXISTS "ActivityLog_guestId_timeslotStart_key";

-- 3. Add new columns
ALTER TABLE "activity_log" 
  ADD COLUMN "categories" "ActivityCategory"[] DEFAULT ARRAY[]::"ActivityCategory"[] NOT NULL,
  ADD COLUMN "mentorNote" VARCHAR(200),
  ALTER COLUMN "description" DROP NOT NULL;

-- 4. Data migration: move existing single category into array position 1
UPDATE "activity_log" SET "categories" = ARRAY["category"]::"ActivityCategory"[] WHERE "category" IS NOT NULL;

-- 5. Drop obsolete single category column
ALTER TABLE "activity_log" DROP COLUMN "category";

-- 6. Recreate unique and index if needed
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_guestId_timeslotStart_key" UNIQUE ("guestId", "timeslotStart");
CREATE INDEX IF NOT EXISTS "activity_log_timeslotStart_idx" ON "activity_log" ("timeslotStart");

-- 7. Adjust FK to cascade on guest delete (drop & recreate)
ALTER TABLE "activity_log" DROP CONSTRAINT IF EXISTS "ActivityLog_guestId_fkey";
ALTER TABLE "activity_log" DROP CONSTRAINT IF EXISTS "activity_log_guestId_fkey";
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
