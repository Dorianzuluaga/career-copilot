-- AlterTable
ALTER TABLE "MasterCv"
ADD COLUMN "profilePhotoPositionX" INTEGER,
ADD COLUMN "profilePhotoPositionY" INTEGER;

UPDATE "MasterCv"
SET "profilePhotoPositionX" = 50,
    "profilePhotoPositionY" = 50
WHERE "profilePhotoObjectKey" IS NOT NULL;

ALTER TABLE "MasterCv"
ADD CONSTRAINT "MasterCv_profilePhotoConfiguration_check"
CHECK (
  (
    "profilePhotoObjectKey" IS NULL
    AND "profilePhotoPositionX" IS NULL
    AND "profilePhotoPositionY" IS NULL
  )
  OR
  (
    "profilePhotoObjectKey" IS NOT NULL
    AND "profilePhotoPositionX" BETWEEN 0 AND 100
    AND "profilePhotoPositionY" BETWEEN 0 AND 100
  )
);

-- AlterTable
ALTER TABLE "OptimizedCv"
ADD COLUMN "profilePhotoPositionX" INTEGER,
ADD COLUMN "profilePhotoPositionY" INTEGER;

UPDATE "OptimizedCv"
SET "profilePhotoPositionX" = 50,
    "profilePhotoPositionY" = 50
WHERE "profilePhotoObjectKey" IS NOT NULL;

ALTER TABLE "OptimizedCv"
ADD CONSTRAINT "OptimizedCv_profilePhotoConfiguration_check"
CHECK (
  (
    "profilePhotoObjectKey" IS NULL
    AND "profilePhotoPositionX" IS NULL
    AND "profilePhotoPositionY" IS NULL
  )
  OR
  (
    "profilePhotoObjectKey" IS NOT NULL
    AND "profilePhotoPositionX" BETWEEN 0 AND 100
    AND "profilePhotoPositionY" BETWEEN 0 AND 100
  )
);
