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

# Phase 4 — Targeted in-memory adaptation

Implement ONLY Phase 4 from:

docs/specs/document-language-export.md

First read and audit the specification and current implementation. Then implement exactly the Phase 4 scope.

Respect the specification as the source of truth. Do not reinterpret or expand the scope.

After implementation:

- run relevant tests
- typecheck
- lint
- build
- inspect the final diff

Do NOT commit or push.

Phase 4 must implement targeted, in-memory export adaptation:

- compare the saved document's workingLanguage with the requested presentationLanguage
- if they are the same, skip AI adaptation entirely
- if they differ, adapt the latest saved Optimized CV and/or Cover Letter in memory
- never regenerate documents from Master CV
- never mutate or persist the adapted result
- always start from the original saved working document so repeated exports never create translation chains
- apply one Presentation Language to both documents

Adapt ONLY the narrative fields defined by the specification.
Keep all protected/verifiable fields unchanged:

- identity/contact information
- names and company/institution names
- job titles
- dates
- skills/technologies
- languages/proficiency
- certifications
- project names/technologies/URLs
- photo fields
- other protected fields explicitly listed in the spec

For Cover Letter:

- adapt only the allowed narrative fields
- keep protected identity/company/signature fields unchanged
- do not let AI translate or generate the date

AI adaptation must be strictly translation/localization:

- preserve facts, meaning, tone, seniority, and level of detail
- do not add, remove, optimize, rewrite, or invent claims
- preserve array lengths, ordering, null semantics, and schema shape
- validate the AI response strictly before using it

Error handling:

- malformed saved document → fail before AI adaptation
- adaptation failure → HTTP 502
- never fall back to the wrong-language saved content
- adaptation must be atomic: do not partially adapt one document if the package adaptation fails
- adapted content remains request-scoped/in-memory only

Security:

- send the minimum required narrative content to the AI
- do not send protected fields when they are not needed for adaptation

Update tests for:

- same-language export skips AI
- different-language export adapts both documents
- only allowed narrative fields change
- protected fields remain unchanged
- repeated exports always start from the saved working document
- adapted results are not persisted
- AI failure returns 502 with no partial adaptation
- malformed data is rejected before AI
- one presentationLanguage applies to both documents

At the end report:

1. Files changed
2. What was implemented
3. Tests and validation results
4. Any deviations or decisions
5. Confirmation that only Phase 4 was implemented

# Phase 5 — Deterministic document chrome and Cover Letter dates

Implement ONLY Phase 5 from:

docs/specs/document-language-export.md

First read and audit the specification and current implementation. Then implement exactly the Phase 5 scope.

Respect the specification as the source of truth. Do not reinterpret or expand the scope.

After implementation:

- run relevant tests
- typecheck
- lint
- build
- inspect the final diff

Do NOT commit or push.

Phase 5 must implement deterministic document localization:

- create/use a server-owned document-localization module for es | en | fr
- provide localized Optimized CV document chrome for:
  professionalSummary
  experience
  education
  skills
  languages
  certifications
  personalProjects
  present
  openProject
- provide deterministic Cover Letter formattedDate for es | en | fr
- pass localized chrome/date data through the export presentation pipeline
- keep localization deterministic; do not use AI for static labels or dates
- ensure Preview and PDF use the same presentation-language catalog
- Presentation Language must determine document chrome, independently from UI locale and workingLanguage

Do not change narrative adaptation from Phase 4 except where necessary to integrate the localized presentation model.

Cover Letter:

- format the date deterministically according to presentationLanguage
- do not ask AI to translate or generate the date
- preserve the underlying saved date/document data

Strictly exclude Phase 6 and unrelated work:

- no additional Preview/PDF architectural redesign
- no generation from Master CV
- no persistence of presentationLanguage
- no persistence of adapted exports
- no Job Analysis/Profile Match language changes
- no Master CV language conversion

Update tests for:

- es/en/fr document chrome
- localized Optimized CV labels
- localized Present/Open project labels
- deterministic Cover Letter dates for es/en/fr
- Preview and PDF receiving the same localized presentation data
- UI locale not affecting document chrome when Presentation Language differs
- no AI call for static chrome/date localization
- existing adaptation behavior remains intact

At the end report:

1. Files changed
2. What was implemented
3. Tests and validation results
4. Any deviations or decisions
5. Confirmation that only Phase 5 was implemented

# Phase 6 — Preview/PDF integration and final safeguards

## Audit

Audit Phase 6 of docs/specs/document-language-export.md against the current implementation.

DO NOT modify code.
DO NOT modify the spec.
DO NOT commit or push.

We have already completed and manually validated:

- Phases 1–5.
- Export Preview cache scoped to ApplicationWorkspacePage, including ES/EN/FR cache reuse.
- Deterministic Language + Proficiency localization for export presentation, shared by Preview and PDF.

Now:

1. Read the complete Phase 6 section of the spec.
2. Inspect the current implementation and tests.
3. For every Phase 6 requirement, classify it:
   - COMPLETE
   - PARTIALLY COMPLETE
   - NOT IMPLEMENTED
4. Identify the exact remaining gaps.
5. Identify anything Phase 6 must NOT touch because it is already working.
6. Pay special attention to:
   - Preview/PDF consistency
   - Presentation Language consistency
   - latest saved documents as export source
   - unsaved editor state
   - AI/adaptation safeguards
   - adaptation failure handling
   - protected fields
   - photo/link behavior
   - Cover Letter date/localization
   - Language + Proficiency localization
   - Export Preview cache behavior
   - no persistence of adapted documents
7. Give the minimal implementation plan:
   - requirement
   - current status
   - gap
   - files to change
   - tests needed
   - manual QA needed
8. List files/functionality that should NOT be touched.

Do not propose broad refactors or new product behavior.

Return:

1. Phase 6 status summary
2. Requirement-by-requirement audit
3. Exact gaps
4. Minimal implementation plan
5. Tests + manual QA checklist
6. Risks
7. Final verdict: READY FOR IMPLEMENTATION or NEEDS CLARIFICATION

AUDIT ONLY. NO CODE CHANGES.

## prompt

Implement Phase 6 according to the audit.

Do NOT modify the spec.
Do NOT modify the Export Preview cache.
Do NOT modify adaptation, document localization, dates, photo handling, project links, filenames, Prisma, generation, or saved-document behavior.

Implement ONLY the identified Phase 6 gaps:

1. PARTIAL PACKAGE FAILURE UX

In ApplicationExport download flow:

- Keep the current sequential download behavior.
- If Optimized CV fails:
  - stop the package immediately;
  - identify Optimized CV in the user-facing error;
  - indicate that the package is incomplete.
- If Optimized CV succeeds and Cover Letter fails:
  - keep the already downloaded CV;
  - stop;
  - identify Cover Letter in the error;
  - indicate that the package is incomplete.
- If only one document is selected and it fails:
  - identify that document;
  - do not falsely describe another document as failed/succeeded.
- Retry must remain user initiated.
- Retry must use the same Presentation Language and latest saved source.
- Never fallback to working-language content.
- Never automatically retry in another language.
- Do not change the API error envelope.
- Localize the user-facing error message for ES/EN/FR using existing i18n infrastructure.
- Do not expose the raw English API error when a localized message can be shown.

Use a small pure helper if appropriate so this behavior is easy to test.

2. TEST COVERAGE

Add the missing Phase 6 tests identified by the audit:

- first selected document fails
- second selected document fails after first succeeds
- single-document failure
- localized 502/adaptation failure message
- retry keeps the same Presentation Language
- explicit UI/Working/Presentation language matrix
- Preview/PDF consistency for language/chrome/date
- photo snapshot/omission regression
- project URL + localized openProject regression
- filenames remain unchanged/unlocalized
- saved documents are the export source, not dirty editor state
- no generation/persistence calls

Reuse existing test infrastructure. Do not introduce a new E2E framework.

IMPORTANT:
Do not rewrite existing cache, adaptation, localization, date, or generation tests unless necessary to accommodate the new assertions.

After implementation run:

- API tests
- Web tests
- typecheck
- lint
- build
- Prettier/diff validation

Do NOT commit.
Do NOT push.

Finally report:

- exact files changed
- exact Phase 6 behavior implemented
- tests added/updated
- validation results
- any remaining risks
