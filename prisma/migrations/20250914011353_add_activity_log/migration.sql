-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('STUDY', 'MEETING', 'EVENT', 'PROJECT', 'OTHER');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "timeslotStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_timeslotStart_idx" ON "ActivityLog"("timeslotStart");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLog_guestId_timeslotStart_key" ON "ActivityLog"("guestId", "timeslotStart");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
