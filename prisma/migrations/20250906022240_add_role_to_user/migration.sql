-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER', 'MANAGER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'SUPER';
