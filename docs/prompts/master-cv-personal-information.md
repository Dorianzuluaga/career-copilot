Implement the approved specification:

docs/specs/master-cv-personal-information.md

Before writing code:

1. Read the specification above and the engineering rules it references.
2. Apply the required amendments to:
   - docs/specs/master-cv-onboarding.md
   - docs/specs/optimized-cv.md
   - docs/specs/export.md

Then implement the specification completely.

Implementation order:
- Prisma/data model + migration
- API/types/validation
- Master CV form and i18n
- AI extraction/integrity flow
- Optimized CV Personal Information propagation
- Optimized CV preview header
- PDF header
- Tests

Strictly preserve:
- Master CV as source of truth
- Optimized CV snapshot semantics
- Export filename ownership
- Cover Letter behavior
- Existing application workflow
- Existing architecture and dependencies

Do not implement anything listed as Out of Scope, especially photo functionality.

Run the required typecheck, lint, tests and production build.

Before finishing, verify Preview and PDF with:
- all fields present
- only required fields
- partial contact rows
- no optional fields
- long URLs
- existing migrated portfolio values
- professional title persistence and propagation

Do not commit, push, merge, or create a PR.

When finished report:
- Summary
- Files modified
- Database migration
- Architectural decisions
- Tests/validation
- Any deviations or assumptions
- Any remaining issues

Wait for review.