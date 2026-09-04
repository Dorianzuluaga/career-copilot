# Phase 1 — Locale contract and generation propagation
Implement ONLY Phase 1 from:

docs/specs/document-language-export.md

First read and audit the specification and current implementation. Then implement exactly the Phase 1 scope.

Respect the specification as the source of truth. Do not reinterpret or expand the scope.

After implementation:
- run tests
- typecheck
- lint
- build
- inspect the final diff

Do NOT commit or push.

Strictly exclude all later phases:
- no DB/persistence for workingLanguage
- no Export / Export Preview
- no presentationLanguage
- no export-time adaptation
- no PDF localization
- no changes to persisted Job Analysis/Profile Match language

Report changed files, implementation summary, validation results, deviations, and confirm that only Phase 1 was implemented.

# Phase 2 — Working Language persistence and legacy compatibility
