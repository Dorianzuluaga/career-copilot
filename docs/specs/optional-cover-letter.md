# Optional Cover Letter Specification

## Feature Information

**Feature Name**

Optional Cover Letter

**Status**

- Draft

**Priority**

- High

---

# Purpose

Cover Letter is an optional Fast Apply output.

Users who only need an Optimized CV must be able to preview and export that CV without generating, saving, loading, or adapting a Cover Letter.

This change removes the current Export lock that treats a saved Cover Letter as required. It does not change Cover Letter generation, editing, or save behavior.

Expected outcome:

- After a saved Optimized CV, both **Continue to Cover Letter** and **Export CV** are valid next actions.
- CV-only Export works when no Cover Letter exists.
- No Cover Letter AI call runs unless the user explicitly generates a Cover Letter, or previews/exports an existing saved Cover Letter that requires presentation-language adaptation.

---

# Dependencies

- Application Workspace navigation
- Optimized CV save
- Cover Letter generate / review / edit / save
- Export preview and PDF
- Document language and Presentation Language (`docs/specs/document-language-export.md`)

---

# Context Required

- `docs/engineering/AI_ENGINEERING.md`
- `docs/engineering/PROJECT_RULES.MD`
- `docs/product/03-mvp-scope.md`
- `docs/product/04-application-workflow.md`
- `docs/product/06-application-workspace.md`
- `docs/product/07-optimized-cv.md`
- `docs/product/08-cover-letter.md`
- `docs/product/09-export.md`
- `docs/specs/optimized-cv.md`
- `docs/specs/cover-letter.md`
- `docs/specs/export.md`
- `docs/specs/workspace-sections.md`
- `docs/specs/document-language-export.md`

---

# Invariants

These rules must not change:

- Master CV remains the single source of truth.
- Job Analysis behavior and contracts remain unchanged.
- Profile Match behavior and contracts remain unchanged.
- Optimized CV generation, review, edit, and save remain unchanged.
- Cover Letter generation remains explicit only: **Generate**, **Try again**, or **Generate again**.
- Cover Letter generation never runs because the workspace loaded, the Cover Letter section opened, Optimized CV was saved, or Export was opened.
- Export never regenerates Optimized CV or Cover Letter from Master CV.
- Export Presentation Language behavior remains unchanged except that a CV-only package applies Presentation Language to the Optimized CV only.
- No `wantsCoverLetter`, `skipCoverLetter`, or equivalent field.
- No Skip Cover Letter action.
- No new `ApplicationStatus` value.
- Absence of the `CoverLetter` row means no Cover Letter is included.

---

# Document States

Cover Letter has three states. Export uses only the saved state.

| State | Meaning | Export |
| --- | --- | --- |
| Does not exist | No `CoverLetter` row. | CV-only. Cover Letter is not selectable or previewable. |
| Exists and is saved | One `CoverLetter` row for the application. | Existing CV + Cover Letter selection, preview, and download. |
| Draft exists but is unsaved | Generated or edited session document only. | Not included. Treated as "does not exist" for Export. |

---

# 1. Current flow vs target flow

## Current flow

```text
Optimized CV saved
        │
        ▼
Cover Letter section available
Export locked
        │
        ▼
User clicks Generate / Try again / Generate again
        │
        ▼
Review / edit draft (not persisted)
        │
        ▼
User clicks Save
        │
        ▼
Export unlocked
        │
        ▼
Preview and download require both saved documents
Backend loads Cover Letter even for Optimized CV preview/PDF
```

Current code that enforces this:

- `WorkspaceNavigation`: `isExportAvailable = isCoverLetterCompleted`
- `ApplicationWorkspacePage`: `onContinueToExport` only when `hasSavedCoverLetter`
- `ApplicationOptimizedCv`: only **Continue to Cover Letter** after save
- `ApplicationExport`: `hasPreviewDocuments = optimizedCv !== null && coverLetter !== null`
- `export.service.requireExportDocuments()`: always `getOptimizedCv` and `getCoverLetter`
- `preparePresentationDocument()`: always `assertStoredCoverLetter()`, including for `document: "optimized-cv"`

Cover Letter generation is already explicit. The defect is the Export gate, not auto-generation.

## Target flow

```text
Optimized CV saved
        │
        ├── Continue to Cover Letter
        │         │
        │         ▼
        │    Generate / review / edit / save
        │    (unchanged explicit generation)
        │         │
        └── Export CV
                  │
                  ├── no Cover Letter row ──► CV-only preview/download
                  └── Cover Letter saved ──► existing CV + Cover Letter Export
```

After a saved Optimized CV:

- Cover Letter remains accessible.
- Export becomes available immediately.
- The user may generate a Cover Letter later, including after a previous CV-only export.

---

# User Workflow

1. User saves an Optimized CV.
2. User chooses **Continue to Cover Letter** or **Export CV**.
3. If the user opens Cover Letter and wants a letter, they explicitly generate, review, edit, and save it.
4. If no Cover Letter exists, Export shows Optimized CV only.
5. If a Cover Letter exists, Export shows the current CV + Cover Letter selection and preview.
6. User may return to Cover Letter after a CV-only export and generate/save a letter. Export then includes it.

---

# Functional Requirements

## 2. Frontend state and navigation

Workspace load already treats `GET /cover-letter` HTTP `404` as `savedCoverLetter === null`. Keep that.

`hasSavedOptimizedCv` remains `savedOptimizedCv !== null`.

`hasSavedCoverLetter` remains `savedCoverLetter !== null`. This flag means "Cover Letter exists and is saved". It must no longer gate Export availability.

Navigation:

- Cover Letter is available after a saved Optimized CV. Cover Letter stays locked until then.
- Export is available after a saved Optimized CV, even when `hasSavedCoverLetter` is false.
- Export stays locked until a saved Optimized CV exists.
- Cover Letter is completed only when a Cover Letter has been saved.
- After a saved Optimized CV, the workspace next recommended step is Export. Cover Letter remains available and is not presented as mandatory.
- There is no Skip Cover Letter control.

Unsaved Cover Letter drafts continue to use the existing unsaved-document guard. An unsaved draft does not unlock Cover Letter in Export.

## 3. Optimized CV → Cover Letter / Export actions

After a valid saved Optimized CV exists, the Optimized CV section must show both actions:

- **Continue to Cover Letter** — existing `optimizedCv.continueToCoverLetter`; navigates to the Cover Letter section.
- **Export CV** — new action; navigates to the Export section.

Neither action generates a Cover Letter.

Cover Letter empty state remains Generate / Try again only. Do not add a Skip Cover Letter button there. Users reach Export from Optimized CV **Export CV** or from workspace navigation.

Cover Letter **Continue to Export** remains available only after a Cover Letter has been saved.

## 4. Export document-selection behavior

When no saved Cover Letter exists:

- Optimized CV is the only selectable and downloadable document.
- Cover Letter checkbox and Cover Letter preview tab are not shown.
- Default selection is Optimized CV only.
- Download sends only `document: "optimized-cv"`.

When a saved Cover Letter exists:

- Preserve current selection: Optimized CV, Cover Letter, or both.
- Default selection remains both documents.
- At least one document must remain selected.
- Frontend still performs one request per selected document.

## 5. Preview behavior

When no saved Cover Letter exists:

- Preview Optimized CV only.
- Do not request `document: "cover-letter"`.
- Do not render Cover Letter preview chrome or a Cover Letter empty preview tab.

When a saved Cover Letter exists:

- Preserve current one-document-at-a-time preview switcher.
- Preview remains read-only.
- Presentation Language continues to apply to every selected/previewed document.

If the user later saves a Cover Letter in the same workspace session, Export must start showing Cover Letter selection and preview without a reload of the application.

## 6. Backend export branching

Request body is unchanged:

```http
POST /api/applications/:id/export/preview
POST /api/applications/:id/export

{
  "document": "optimized-cv" | "cover-letter",
  "presentationLanguage": "es" | "en" | "fr"
}
```

Branch on `document` after authentication and request validation.

### CV-only (`document: "optimized-cv"`)

- Load and validate the saved Optimized CV only.
- Do not call `getCoverLetter`.
- Do not assert that a Cover Letter exists.
- Do not call `generateCoverLetter`, `generateCoverLetterDraft`, or `adaptCoverLetterNarrative`.
- Prepare Optimized CV presentation using existing Optimized CV adaptation rules.
- Missing Optimized CV → HTTP `400`. Missing Cover Letter is not an error.

### Cover Letter (`document: "cover-letter"`)

- Load and validate the saved Cover Letter only.
- Do not require Export to load a Cover Letter for any other document type.
- Missing Cover Letter → HTTP `400`.
- Prepare Cover Letter presentation using existing Cover Letter adaptation rules.
- Do not call Cover Letter generation.

When a Cover Letter exists and the user downloads both documents, the frontend still sends two requests. The Optimized CV request must remain CV-only on the backend.

## 7. Conditions under which Cover Letter data may be loaded

Cover Letter data may be loaded only when:

- Workspace load / Cover Letter section: `GET /api/applications/:id/cover-letter`
- Explicit save: `PUT /api/applications/:id/cover-letter`
- Export preview or PDF with `document: "cover-letter"`

Cover Letter data must not be loaded when:

- Previewing or exporting `document: "optimized-cv"`
- Generating or saving Optimized CV
- Running Job Analysis or Profile Match

`GET /cover-letter` continues to return HTTP `404` when no row exists. The frontend continues to treat that as `null`.

## 8. Conditions under which Cover Letter adaptation AI may run

`adaptCoverLetterNarrative` may run only when all of the following are true:

- The request `document` is `"cover-letter"`.
- A saved Cover Letter was loaded for that request.
- Presentation Language differs from Cover Letter Working Language, or Working Language is `null` (existing legacy rule).

It must not run for Optimized CV preview or PDF.

## 9. Guarantee that CV-only export cannot trigger any Cover Letter AI call

For `document: "optimized-cv"` preview and PDF, the backend must not call:

- `generateCoverLetter`
- `generateCoverLetterDraft`
- `adaptCoverLetterNarrative`
- any other Cover Letter generation or Cover Letter narrative-adaptation path

Tests must spy these functions and assert they were not called.

The frontend must not `POST /cover-letter` from Export or from **Export CV**.

## 10. Existing Cover Letter generation/save flow that must remain unchanged

Do not change:

- `POST /api/applications/:id/cover-letter` request/response
- explicit Generate / Try again / Generate again
- draft assembly from Master CV, Job Analysis, Profile Match, and saved Optimized CV
- review and manual editing
- `PUT /api/applications/:id/cover-letter` save/upsert
- one Cover Letter per application
- generation does not persist; only Save persists
- generating again does not replace the saved Cover Letter until Save
- unsaved drafts exist only in the current workspace session
- Cover Letter requires a saved Optimized CV
- Cover Letter header has no profile photo

## 11. API contracts and error behavior

Keep existing routes. Do not add Cover Letter preference fields.

| Request | Missing Optimized CV | Missing Cover Letter |
| --- | --- | --- |
| `GET /cover-letter` | n/a | `404` Cover Letter not found. |
| `POST /cover-letter` | `404` Optimized CV not found. | Allowed. |
| `PUT /cover-letter` | Application ownership only, unchanged. | Upsert allowed. |
| Preview/PDF `optimized-cv` | `400` Optimized CV required. | Allowed. No Cover Letter load. |
| Preview/PDF `cover-letter` | Not required for this document. | `400` Cover Letter required for this document. |

Replace the current Export error:

```text
A saved Optimized CV and Cover Letter are required before export.
```

Use document-specific missing-document errors. Do not reject CV-only Export because Cover Letter is absent.

Invalid `document` or `presentationLanguage` remains HTTP `400` before loading documents or calling AI.

Cover Letter adaptation failure remains HTTP `502` and must not persist adapted content.

Export must not modify Application, Optimized CV, Cover Letter, or Master CV.

## 12. Cache / in-memory behavior

Reuse the existing Export preview cache keyed by `applicationId + document + presentationLanguage`.

Required behavior:

- Do not prefetch `cover-letter` preview when no saved Cover Letter exists.
- Failed previews remain uncached.
- Saving Optimized CV continues to invalidate Optimized CV cache entries.
- Saving Cover Letter continues to invalidate Cover Letter cache entries.
- After a Cover Letter is saved in the current workspace, Export may fetch Cover Letter preview on demand.

No new persistent cache or export record.

## 13. i18n requirements

Provide `es`, `en`, and `fr` for every new or changed user-visible string.

Required copy updates:

- New Optimized CV action **Export CV** (`optimizedCv.exportCv` or equivalent).
- `export.requiresDocuments` must no longer require a Cover Letter. It applies only when the saved Optimized CV is missing.
- `export.presentationLanguageHelp` must not say the language always applies to both documents. When no Cover Letter exists, it applies to the Optimized CV only. When a Cover Letter exists, existing both-document meaning remains.
- Workspace next-step text after a saved Optimized CV must not present Cover Letter as the only next step.
- No Skip Cover Letter string.

Existing Cover Letter Generate / Try again / Generate again / Save / Continue to Export strings remain.

Update `apps/web/src/i18n/translate.test.ts` key lists for any added keys.

## 14. Validation and regression requirements

Must pass:

- Export is available after saved Optimized CV with no Cover Letter.
- Cover Letter stays locked until saved Optimized CV.
- Optimized CV shows **Continue to Cover Letter** and **Export CV** after save.
- **Export CV** and Export navigation do not call `POST /cover-letter`.
- Cover Letter empty state still requires explicit Generate.
- CV-only preview and PDF succeed with no Cover Letter row.
- Cover Letter checkbox/tab are absent when no Cover Letter exists.
- After later Cover Letter save, Export shows CV + Cover Letter without requiring a new application.
- Unsaved Cover Letter draft is not previewed or downloaded.
- `document: "optimized-cv"` never calls Cover Letter generation or adaptation AI, including when a Cover Letter row exists.
- `document: "cover-letter"` without a saved Cover Letter returns `400` and makes no adaptation AI call.
- When a Cover Letter exists, current selection of CV, Cover Letter, or both still works.
- Same-language Cover Letter export still skips adaptation.
- Different-language Cover Letter export still adapts only Cover Letter narrative fields.
- Job Analysis, Profile Match, and Optimized CV generation tests remain green without contract changes.
- Presentation Language still applies to every document actually included in the current Export.

---

# UI Requirements

Optimized CV (saved):

- Keep existing generate / edit / save controls.
- Show **Continue to Cover Letter**.
- Show **Export CV**.

Cover Letter (no document):

- Keep explicit Generate.
- Do not auto-generate.
- Do not add Skip Cover Letter.

Export (no Cover Letter):

- Show Optimized CV preview, Presentation Language, and Download.
- Hide Cover Letter selection and preview tab.

Export (saved Cover Letter):

- Preserve current selection, preview switcher, Presentation Language, and Download.

---

# Business Rules

- Export availability depends on a saved Optimized CV, not a saved Cover Letter.
- Saved documents are the only Export source. Drafts are not exportable.
- One Cover Letter per application, only if the user saves one.
- Absence of the Cover Letter row is the skip signal. Do not persist skip intent.
- `ApplicationStatus` remains `NEW`.
- PDF generation still starts only after explicit Download.

---

# Acceptance Criteria

Given a saved Optimized CV and no Cover Letter

When the user opens the Application Workspace

Then Cover Letter and Export are available, and Export is not locked.

---

Given a saved Optimized CV and no Cover Letter

When the user chooses Export CV

Then Export previews and can download the Optimized CV only, and no Cover Letter AI call occurs.

---

Given a saved Optimized CV and no Cover Letter

When Export is open

Then Cover Letter is not selectable or previewable, and the backend does not load Cover Letter data for the Optimized CV request.

---

Given no Cover Letter

When the frontend previews or downloads Optimized CV

Then the request is `document: "optimized-cv"`, and `generateCoverLetterDraft` and `adaptCoverLetterNarrative` are not called.

---

Given a saved Cover Letter

When the user opens Export

Then current CV + Cover Letter selection, preview, download, and Presentation Language behavior remain.

---

Given a previous CV-only export

When the user later generates and saves a Cover Letter

Then Export may include Optimized CV and Cover Letter.

---

Given the Cover Letter section with no saved letter

When the section is opened

Then no generation AI call runs until Generate / Try again / Generate again.

---

Given `document: "cover-letter"` and no saved Cover Letter

When preview or PDF is requested

Then the API returns HTTP `400` and does not call Cover Letter adaptation AI.

---

# Technical Notes

Reuse existing components and services. Do not add routes or Prisma fields.

Likely production files:

Frontend

- `apps/web/src/components/WorkspaceNavigation.tsx`
- `apps/web/src/components/ApplicationWorkspace.tsx` (only if navigation props must change)
- `apps/web/src/pages/ApplicationWorkspacePage.tsx`
- `apps/web/src/components/ApplicationOptimizedCv.tsx`
- `apps/web/src/components/ApplicationExport.tsx`
- `apps/web/src/i18n/messages.ts`

Backend

- `apps/api/src/services/export.service.ts`
- `apps/api/src/services/export-presentation.service.ts`

Likely tests:

- `apps/web/src/App.test.tsx`
- `apps/web/src/components/ApplicationExport.test.tsx`
- `apps/web/src/i18n/translate.test.ts`
- `apps/api/src/services/export.service.test.ts`
- `apps/api/src/services/export-presentation.service.test.ts`
- `apps/api/src/app.test.ts`

Do not change unless a caller requires it:

- `apps/api/src/services/cover-letter.service.ts`
- `apps/api/src/services/cover-letter-ai.service.ts`
- `apps/api/src/controllers/cover-letter.controller.ts`
- `apps/web/src/services/cover-letter.ts`
- `apps/web/src/components/ApplicationCoverLetter.tsx`
- Prisma schema and migrations

`preparePresentationDocument` currently requires `{ optimizedCv, coverLetter }`. Change it so Optimized CV preparation does not receive or assert a Cover Letter.

`requireExportDocuments` must stop loading both documents for every request.

---

# AI Considerations

Cover Letter generation AI is unchanged and remains user-triggered.

Cover Letter presentation/adaptation AI remains the existing Export path and may run only for `document: "cover-letter"` when language adaptation is required.

CV-only Export may still run Optimized CV presentation/adaptation AI under existing Presentation Language rules. That is not a Cover Letter AI call.

---

# Out of Scope

- Skip Cover Letter action or copy
- `wantsCoverLetter`, `skipCoverLetter`, or equivalent persistence
- New application completion status
- Job Analysis changes
- Profile Match changes
- Optimized CV generation/edit/save contract changes
- Cover Letter prompt, schema, or generation-input changes
- Regenerating any document during Export
- Changing Presentation Language options or adding per-document language selectors
- ZIP export, new file formats, or filename rule changes
- Profile photo on Cover Letter
- Prisma/schema/migrations
- Implementation and tests in this documentation task

---

# Implementation Phases

Phase 1 — Workspace navigation and Optimized CV actions

Unlock Export after saved Optimized CV. Add **Export CV**. Keep Cover Letter locked until Optimized CV is saved.

Phase 2 — Export UI for missing Cover Letter

CV-only selection, preview, and download. Hide Cover Letter controls when no saved Cover Letter exists.

Phase 3 — Backend CV-only branching

Load Cover Letter only for `document: "cover-letter"`. Document-specific missing-document errors. Spies proving no Cover Letter AI on CV-only.

Phase 4 — i18n and regression

Locale strings and the regression list in section 14.

Each phase must be independently testable. Do not implement later phases in an earlier phase.

---

# Related Documentation

- `docs/product/06-application-workspace.md`
- `docs/product/07-optimized-cv.md`
- `docs/product/08-cover-letter.md`
- `docs/product/09-export.md`
- `docs/specs/cover-letter.md`
- `docs/specs/export.md`
- `docs/specs/optimized-cv.md`
- `docs/specs/document-language-export.md`

If this specification conflicts with an older Export prerequisite that required both documents, this specification and the updated product docs above have priority.

---

# Spec Validation Checklist

- [x] Current flow vs target flow defined.
- [x] Frontend state and navigation defined.
- [x] Optimized CV next actions defined.
- [x] Export selection defined with and without Cover Letter.
- [x] Preview defined with and without Cover Letter.
- [x] Backend CV-only and Cover Letter branching defined.
- [x] Cover Letter load conditions defined.
- [x] Cover Letter adaptation AI conditions defined.
- [x] CV-only Cover Letter AI prohibition defined.
- [x] Unchanged Cover Letter generation/save flow defined.
- [x] API contracts and errors defined.
- [x] Cache behavior defined.
- [x] i18n requirements defined.
- [x] Validation and regression requirements defined.
- [x] Out of scope defined.
