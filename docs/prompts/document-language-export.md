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

Implement ONLY Phase 2 from:

docs/specs/document-language-export.md

First read and audit the specification and current implementation. Then implement exactly the Phase 2 scope.

Respect the specification as the source of truth. Do not reinterpret or expand the scope.

After implementation:

- run relevant tests
- typecheck
- lint
- build
- inspect the final diff

Do NOT commit or push.

Strictly exclude all later phases:

- no Export / Export Preview
- no presentationLanguage
- no export-time adaptation
- no PDF localization
- no changes to Job Analysis/Profile Match language behavior

Phase 2 must establish persistence and backward compatibility for workingLanguage:

- add the shared Prisma SupportedLocale enum as defined by the spec
- add nullable workingLanguage fields to OptimizedCv and CoverLetter
- create and apply the required migration
- persist workingLanguage when saving newly generated documents
- preserve legacy rows with NULL workingLanguage
- do not guess or backfill language for legacy rows
- ensure GET/editor flows handle NULL legacy values safely
- preserve existing save/edit behavior and all existing functionality

Also update the relevant tests to cover:

- persistence of workingLanguage for new saves
- es/en/fr values
- legacy NULL rows
- GET/editor behavior with NULL
- save/update behavior
- migration/schema expectations

At the end report:

1. Files changed
2. Migration created/applied
3. What was implemented
4. Tests and validation results
5. Any deviations or decisions
6. Confirmation that only Phase 2 was implemented

# Phase 3 — Presentation Language contract and Export UX

Implement ONLY Phase 3 from:

docs/specs/document-language-export.md

First read and audit the specification and current implementation. Then implement exactly the Phase 3 scope.

Respect the specification as the source of truth. Do not reinterpret or expand the scope.

After implementation:

- run relevant tests
- typecheck
- lint
- build
- inspect the final diff

Do NOT commit or push.

Phase 3 must establish the Presentation Language contract and Export UX:

- add and validate presentationLanguage using es | en | fr
- update the export request contract to accept:
  { document, presentationLanguage }
- add the Presentation Language selector to the Export flow
- use one selected Presentation Language for both Optimized CV and Cover Letter exports
- ensure Export Preview uses the selected Presentation Language
- keep the selected Presentation Language independent from UI locale and workingLanguage
- use the latest saved Optimized CV and Cover Letter as the export source
- do not regenerate documents during Export
- do not persist Presentation Language as document truth
- browser/local persistence may be used only as an optional UX convenience, as defined by the spec

Strictly exclude all later phases:

- no export-time AI adaptation
- no document translation/localization of narrative content yet
- no PDF chrome localization
- no Cover Letter localized date formatting
- no changes to Job Analysis/Profile Match language behavior
- no database field for presentationLanguage
- no export records

Update tests for:

- presentationLanguage validation
- export request contract
- one language applied to both documents
- Export Preview using the selected language
- independence from UI locale / workingLanguage
- latest saved documents remain the export source
- no generation/regeneration during Export

At the end report:

1. Files changed
2. What was implemented
3. Tests and validation results
4. Any deviations or decisions
5. Confirmation that only Phase 3 was implemented
