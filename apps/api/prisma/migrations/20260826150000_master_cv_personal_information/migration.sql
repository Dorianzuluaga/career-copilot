-- RenameTable column: preserve existing portfolio URLs as website.
ALTER TABLE "MasterCv" RENAME COLUMN "portfolio" TO "website";
ALTER TABLE "OptimizedCv" RENAME COLUMN "portfolio" TO "website";

-- AlterTable
ALTER TABLE "MasterCv" ADD COLUMN "professionalTitle" TEXT;
ALTER TABLE "OptimizedCv" ADD COLUMN "professionalTitle" TEXT;
