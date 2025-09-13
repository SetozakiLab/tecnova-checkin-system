-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('ES1', 'ES2', 'ES3', 'ES4', 'ES5', 'ES6', 'JH1', 'JH2', 'JH3', 'HS1', 'HS2', 'HS3');

-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "grade" "Grade";
