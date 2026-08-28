import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../prisma/migrations/20260826150000_master_cv_personal_information/migration.sql",
);

describe("Master CV personal information migration", () => {
  it("renames portfolio to website without dropping existing values", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain(
      'ALTER TABLE "MasterCv" RENAME COLUMN "portfolio" TO "website"',
    );
    expect(sql).toContain(
      'ALTER TABLE "OptimizedCv" RENAME COLUMN "portfolio" TO "website"',
    );
    expect(sql).toContain(
      'ALTER TABLE "MasterCv" ADD COLUMN "professionalTitle" TEXT',
    );
    expect(sql).toContain(
      'ALTER TABLE "OptimizedCv" ADD COLUMN "professionalTitle" TEXT',
    );
    expect(sql).not.toContain("DROP COLUMN");
    expect(sql).not.toContain("CREATE TABLE");
  });
});
