import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const apiRoot = fileURLToPath(new URL("../../", import.meta.url));
const schema = readFileSync(path.join(apiRoot, "prisma/schema.prisma"), "utf8");
const migration = readFileSync(
  path.join(
    apiRoot,
    "prisma/migrations/20260904200000_add_document_working_language/migration.sql",
  ),
  "utf8",
);

describe("working language schema", () => {
  it("defines one shared SupportedLocale enum with es, en, and fr", () => {
    expect(schema).toContain(`enum SupportedLocale {
  es
  en
  fr
}`);
    expect(schema.match(/enum SupportedLocale/g)).toHaveLength(1);
  });

  it("adds nullable workingLanguage fields to OptimizedCv and CoverLetter", () => {
    expect(schema.match(/workingLanguage\s+SupportedLocale\?/g)).toHaveLength(
      2,
    );
    expect(schema).toMatch(
      /model OptimizedCv \{[\s\S]*workingLanguage\s+SupportedLocale\?/,
    );
    expect(schema).toMatch(
      /model CoverLetter \{[\s\S]*workingLanguage\s+SupportedLocale\?/,
    );
  });

  it("does not persist Presentation Language", () => {
    expect(schema).not.toContain("presentationLanguage");
  });

  it("creates a nullable migration without backfilling legacy rows", () => {
    expect(migration).toContain(
      `CREATE TYPE "SupportedLocale" AS ENUM ('es', 'en', 'fr');`,
    );
    expect(migration).toContain(
      `ALTER TABLE "OptimizedCv" ADD COLUMN "workingLanguage" "SupportedLocale";`,
    );
    expect(migration).toContain(
      `ALTER TABLE "CoverLetter" ADD COLUMN "workingLanguage" "SupportedLocale";`,
    );
    expect(migration).not.toMatch(/NOT NULL/);
    expect(migration).not.toMatch(/UPDATE\s+"OptimizedCv"/);
    expect(migration).not.toMatch(/UPDATE\s+"CoverLetter"/);
  });
});
