-- AlterTable
ALTER TABLE "guests" ALTER COLUMN "displayId" DROP DEFAULT;
DROP SEQUENCE "guests_displayId_seq";
