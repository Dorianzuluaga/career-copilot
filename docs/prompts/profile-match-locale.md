# phase 1 - Profile Match working language persistence

Implement Phase 1 of the approved Profile Match UI Locale specification only.

Phase 1 objective:
Persist the known generation language on new ProfileMatch rows without guessing or modifying legacy rows.

Scope:
- Add nullable ProfileMatch.workingLanguage using the existing SupportedLocale Prisma enum.
- Create the required Prisma migration.
- On the existing first successful Profile Match generation, persist workingLanguage equal to the already validated request locale.
- Expose workingLanguage in Profile Match API/domain responses as es | en | fr | null.
- Existing ProfileMatch rows must remain null.
- Existing generate-once behavior must remain unchanged.
- Existing POST behavior when a ProfileMatch already exists must remain unchanged: return the persisted row, do not regenerate, do not restamp workingLanguage.
- Existing GET must return persisted workingLanguage.
- Keep getProfileComparison as the persisted source loader for downstream Optimized CV and Cover Letter.
- Add/update tests for all of the above.

Do NOT implement:
- presentation endpoint
- AI adaptation
- locale-change behavior
- frontend cache
- presentation loading/error states
- Job Analysis changes
- Optimized CV changes
- Cover Letter changes
- Export changes
- scoring changes
- generation prompt changes
- any translation behavior

Important:
- Reuse the existing SupportedLocale enum and validation.
- Do not infer or backfill legacy workingLanguage.
- Do not modify existing ProfileMatch rows.
- Do not create a second locale system.
- Do not modify the six Profile Match AI generation steps.

Before changing code, inspect the current implementation and identify the exact files that will be modified.

Then implement only Phase 1.

After implementation run the relevant API tests plus typecheck, lint, build, Prisma validation/migration checks, and report the results.

Do not commit yet.

# Phase 2 — Backend presentation pipeline

