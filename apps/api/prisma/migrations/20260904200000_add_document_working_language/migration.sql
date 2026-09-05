-- CreateEnum
CREATE TYPE "SupportedLocale" AS ENUM ('es', 'en', 'fr');

-- AlterTable
ALTER TABLE "OptimizedCv" ADD COLUMN "workingLanguage" "SupportedLocale";

-- AlterTable
ALTER TABLE "CoverLetter" ADD COLUMN "workingLanguage" "SupportedLocale";
