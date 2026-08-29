import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migrationsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../prisma/migrations",
);
const photoKeyMigrationPath = join(
  migrationsDir,
  "20260828140000_add_profile_photo/migration.sql",
);
const photoPositionMigrationPath = join(
  migrationsDir,
  "20260828190000_add_profile_photo_position/migration.sql",
);

describe("Master CV profile photo migration", () => {
  it("adds nullable photo keys without backfill", () => {
    const sql = readFileSync(photoKeyMigrationPath, "utf8");

    expect(sql).toContain(
      'ALTER TABLE "MasterCv" ADD COLUMN "profilePhotoObjectKey" TEXT',
    );
    expect(sql).toContain(
      'ALTER TABLE "OptimizedCv" ADD COLUMN "profilePhotoObjectKey" TEXT',
    );
    expect(sql).not.toContain("profilePhotoPositionX");
    expect(sql).not.toContain("profilePhotoPositionY");
    expect(sql).not.toContain("NOT NULL");
    expect(sql).not.toContain("avatar");
    expect(sql).not.toContain("UPDATE ");
    expect(sql).not.toContain("DROP COLUMN");
  });

  it("adds nullable photo position columns and centers existing photos", () => {
    const sql = readFileSync(photoPositionMigrationPath, "utf8");

    expect(sql).toContain('ADD COLUMN "profilePhotoPositionX" INTEGER');
    expect(sql).toContain('ADD COLUMN "profilePhotoPositionY" INTEGER');
    expect(sql).not.toContain('ADD COLUMN "profilePhotoObjectKey"');
    expect(sql).toContain('UPDATE "MasterCv"');
    expect(sql).toContain('UPDATE "OptimizedCv"');
    expect(sql.match(/"profilePhotoPositionX" = 50/g)).toHaveLength(2);
    expect(sql.match(/"profilePhotoPositionY" = 50/g)).toHaveLength(2);
    expect(sql).toContain('WHERE "profilePhotoObjectKey" IS NOT NULL');
    expect(sql).toContain("BETWEEN 0 AND 100");
    expect(sql).not.toMatch(/ADD COLUMN "[^"]+" (?:TEXT|INTEGER) NOT NULL/);
    expect(sql).not.toContain("avatar");
    expect(sql).not.toContain("DROP COLUMN");
  });
});
