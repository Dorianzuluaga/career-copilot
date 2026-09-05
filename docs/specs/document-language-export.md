# Document Language & Export Localization Specification

## Feature information

**Status:** Implemented (Phases 1–6 complete). The unresolved product decision identified in this specification remains open.

**Supported locales:** `es`, `en`, `fr`

## Purpose

Define the language contract for Career Copilot's application workflow and final document export.

This feature separates four concepts that must never be conflated:

1. **Original job language** — the language and content supplied by the user in `JobOffer.originalDescription`.
2. **UI locale** — the language of the application's interface and working experience.
3. **Working language** — the persisted language of a saved Optimized CV or Cover Letter.
4. **Presentation Language** — the export-time language selected for the complete Optimized CV + Cover Letter package.

The implementation must preserve saved user edits, keep the original job offer and Master CV unchanged, and localize final presentation without regenerating working documents.

## Source of truth and related specifications

This specification incorporates the completed **localization export architecture audit** and the approved product decisions for this feature.

Related specifications:

- `docs/specs/job-analysis.md`
- `docs/specs/job-analysis-2.md`
- `docs/specs/optimized-cv.md`
- `docs/specs/cover-letter.md`
- `docs/specs/export.md`
- `docs/specs/master-cv-profile-photo.md`
- `docs/specs/master-cv-personal-information.md`

If an earlier specification describes Export as having no AI involvement, this specification narrows that rule: Export must not generate or optimize documents, but may perform targeted in-memory language adaptation of the latest saved documents when Presentation Language differs from Working Language.

## Definitions and ownership

### Original job language

The original job language is whatever language the user used in `JobOffer.originalDescription`.

- `JobOffer.originalDescription` must remain byte-for-byte unchanged after it is accepted and saved, except for behavior already required before this feature such as initial request transport.
- It must never be translated, rewritten, or overwritten by analysis, generation, adaptation, preview, or export.
- It does not select or override UI locale, Working Language, or Presentation Language.

### UI locale

UI locale is the user's application language preference.

- Supported values are `es`, `en`, and `fr`.
- The existing web locale model and locale validation must be reused.
- UI locale controls interface chrome and the output language requested for initial Job Analysis, Profile Match, Optimized CV generation, and Cover Letter generation.
- A UI locale change affects subsequent generation requests.
- A UI locale change must not mutate, relabel, translate, regenerate, or overwrite an already saved Optimized CV or Cover Letter.

### Working Language

Working Language is persisted independently on each saved working document:

- `OptimizedCv.workingLanguage`
- `CoverLetter.workingLanguage`

It identifies the language contract under which that document draft was generated and saved. It is document metadata, not a user-editable text field.

- A newly generated draft receives the UI locale used by its generation request.
- The draft carries that value through review, editing, and Save.
- Manual text edits do not change Working Language.
- Changing UI locale does not change an existing draft's or saved document's Working Language.
- Generating a new draft under a different UI locale gives the new draft the new locale. Working Language changes in persistence only if the user explicitly saves that new draft over the existing saved document.
- Optimized CV and Cover Letter Working Languages may differ.

### Presentation Language

Presentation Language is selected only in Export.

- Supported values are `es`, `en`, and `fr`.
- One value applies to the complete application package: Optimized CV + Cover Letter.
- It is independent of UI locale, both document Working Languages, original job language, Master CV language, company country, and any inferred language.
- It is passed per preview/export request.
- It must not be persisted as document truth, on `Application`, or in a new export record.
- The frontend may remember the last selection in browser storage as a convenience. Such a value is only a UI default and must be validated again.
- Every preview or export may choose another Presentation Language without mutating either saved document.

## Core invariants

The following rules are mandatory:

1. The latest saved Optimized CV and latest saved Cover Letter are the only content sources for Export.
2. Unsaved editor state is not exportable under the current explicit-Save architecture. The UI must continue to make Save status clear before entering Export.
3. User edits present in the latest saved documents are authoritative.
4. Export must never call Optimized CV generation, Cover Letter generation, or any generation path that starts from Master CV.
5. Export must not read Master CV to populate document body content. Existing filename-only access may remain.
6. Export must not modify Master CV, Job Offer, Job Analysis, Profile Match, Optimized CV, Cover Letter, or Application data.
7. Adaptation always starts from the saved working document, never from a prior adapted result.
8. Adapted presentation documents are in-memory, request-scoped values and are never persisted.
9. No translation chain is permitted. Each target is derived directly from the saved working version:

   ```text
   Saved working version
   ├── Export ES
   ├── Export EN
   └── Export FR
   ```

10. Both package documents use the same Presentation Language even if their Working Languages differ.
11. Presentation Language must not be inferred from original job language, UI locale, Master CV language, company country, or document content.
12. Export adaptation is translation/localization only. It is not optimization, regeneration, or content improvement.

## User workflow

1. The user works in the selected UI locale.
2. Initial Job Analysis and Profile Match requests carry that UI locale.
3. Initial Optimized CV generation carries that UI locale and returns a draft with the same Working Language.
4. The user reviews, edits, and explicitly saves the Optimized CV. Save persists its Working Language.
5. Initial Cover Letter generation carries the current UI locale and returns a draft with the same Working Language.
6. The user reviews, edits, and explicitly saves the Cover Letter. Save persists its Working Language.
7. The user enters Export.
8. The user selects one Presentation Language for the complete CV + Cover Letter package.
9. Export Preview prepares each saved document under that Presentation Language.
10. The user selects Optimized CV, Cover Letter, or both and explicitly downloads.
11. Each selected PDF is prepared from the latest saved document using the same Presentation Language contract as preview.

Normal Optimized CV and Cover Letter workspaces continue to show the saved working documents. They do not switch to Presentation Language.

Example:

```text
UI locale: ES
Optimized CV Working Language: ES
Cover Letter Working Language: ES
Presentation Language: FR

Optimized CV workspace: ES
Cover Letter workspace: ES
Export preview: FR
Downloaded PDFs: FR
```

## UI locale propagation and AI generation

### Request contract

The frontend must send the active UI locale explicitly in the JSON body of each generation request:

```json
{
  "locale": "es"
}
```

This applies to:

- `POST /api/applications/:id/job-analysis`
- `POST /api/applications/:id/profile-comparison`
- `POST /api/applications/:id/optimized-cv`
- `POST /api/applications/:id/cover-letter`

The locale must not be derived solely from `Accept-Language`, browser settings, or server defaults.

### Validation

- The API must validate `locale` against `es | en | fr` at the controller boundary.
- Missing, malformed, or unsupported values return HTTP `400`.
- Validation must occur before an AI request or database write.
- The API must use one server-side supported-locale type guard for generation and export request validation.
- The web must continue to use its existing `Locale` model. Client and server supported values must have contract tests to prevent drift.

### AI propagation

The validated locale must reach the service that creates each AI request.

The generation language instruction must require:

- Job Analysis narrative output in UI locale.
- Profile Match strengths, weaknesses, alignment reasoning, and recommendation in UI locale.
- Optimized CV generated narrative fields in UI locale.
- Cover Letter generated narrative fields in UI locale.

Verifiable names, skills, technologies, URLs, contact details, and other protected facts remain unchanged even when their source spelling differs from UI locale.

Job Analysis and Profile Match must continue to use the original job content or existing structured data as currently defined. Propagating locale must not translate or overwrite `JobOffer.originalDescription`.

### Generation responses

Optimized CV and Cover Letter generation responses must include:

```ts
workingLanguage: "es" | "en" | "fr";
```

The response value must equal the validated request locale. The frontend must retain it with the draft through review and editing.

## Persistence and data model

### Prisma model changes required during implementation

Introduce one shared Prisma enum:

```prisma
enum SupportedLocale {
  es
  en
  fr
}
```

Add nullable fields:

```prisma
model OptimizedCv {
  // existing fields
  workingLanguage SupportedLocale?
}

model CoverLetter {
  // existing fields
  workingLanguage SupportedLocale?
}
```

The database fields are nullable only for backward compatibility with rows created before this feature. Application behavior must require a non-null value for every newly saved document.

No field for Presentation Language may be added to `Application`, `OptimizedCv`, `CoverLetter`, or another persistent model. No export model or export-version model is introduced.

### API and domain types

Public and internal document contracts must expose:

```ts
workingLanguage: "es" | "en" | "fr" | null;
```

Newly generated and newly saved documents must return a non-null value. `null` is reserved for legacy rows.

### Save contract

The Save payload for both working documents must include `workingLanguage`.

- The API validates it against supported locales before persistence.
- A newly generated draft retains the generation request's locale even if UI locale changes before Save.
- Editor controls must not allow direct modification of this metadata.
- The frontend must not replace draft Working Language with the current UI locale during Save.
- Saving ordinary manual edits preserves the draft/saved Working Language.
- Saving a newly generated draft in another locale replaces both document content and Working Language as one explicit Save operation.

### Existing rows without Working Language

Existing rows cannot be safely backfilled from current database state because neither UI locale at generation time nor document language was persisted.

The compatibility strategy is therefore:

1. Keep the database fields nullable.
2. Return `workingLanguage: null` for legacy rows; do not substitute UI locale, default locale, original job language, or Master CV language.
3. Do not update a legacy row merely because it was read, previewed, or exported.
4. During export, `null` means language equality cannot be proven. The targeted adaptation path must run against the saved document for the selected Presentation Language.
5. The legacy adaptation instruction must leave already-target-language narrative text unchanged and adapt only text that requires adaptation.
6. If adaptation cannot complete, fail safely. Do not render an assumed-language fallback.
7. A legacy row acquires a non-null Working Language only when the user explicitly saves a newly generated draft whose locale is known. Saving existing legacy text without regeneration must not stamp the current UI locale onto it.

This strategy may consume adaptation AI for a legacy document already written in the target language, but it avoids silently assigning incorrect metadata or exporting in an unverified language.

## Export UI requirements

Presentation Language must appear only in the Export step.

- It must not appear in the global language selector.
- It must not be required while reviewing or editing Optimized CV or Cover Letter.
- The control offers exactly Español (`es`), English (`en`), and Français (`fr`).
- The UI must state that the selection applies to both Optimized CV and Cover Letter.
- Both selected download requests must use the same value.
- Changing the preview tab must not change Presentation Language.
- Changing Presentation Language shows that language's preview, fetching on cache miss. It does not wipe other cached languages. Multiple `es`, `en`, and `fr` previews may coexist in the same Application Workspace.
- The UI may default the selection to a validated browser-stored preference. If none exists, it may use the current UI locale as an initial convenience only; this default is not an inference and must remain visibly user-selectable.
- UI chrome around Export follows UI locale. Document content and document chrome inside Export Preview follow Presentation Language.
- While a presentation preview is being prepared, the UI must not show the saved working-language body under target-language chrome as if it were final.
- Preview is read-only.
- Existing document selection, visual design, layout, profile-photo behavior, project-link behavior, and explicit Download action remain unchanged.

## Export API contract

### PDF request

```http
POST /api/applications/:id/export
Content-Type: application/json

{
  "document": "optimized-cv" | "cover-letter",
  "presentationLanguage": "es" | "en" | "fr"
}
```

The successful response remains one `application/pdf` with the existing `Content-Disposition` behavior.

### Preview request

Export Preview requires a read-only API path because a different-language body cannot be produced by the current browser-only preview.

```http
POST /api/applications/:id/export/preview
Content-Type: application/json

{
  "document": "optimized-cv" | "cover-letter",
  "presentationLanguage": "es" | "en" | "fr"
}
```

The successful response is a validated presentation view model:

```ts
type ExportPreviewResponse =
  | {
      document: "optimized-cv";
      presentationLanguage: SupportedLocale;
      data: OptimizedCvPresentationDocument;
      chrome: OptimizedCvDocumentChrome;
    }
  | {
      document: "cover-letter";
      presentationLanguage: SupportedLocale;
      data: CoverLetterPresentationDocument;
      chrome: CoverLetterDocumentChrome;
    };
```

Preview and PDF preparation must call the same application service and use the same:

- saved-document loader;
- Working Language decision;
- adaptation contract and validation;
- deterministic document chrome resolver;
- Cover Letter date formatter;
- deterministic Language name and Proficiency label transform;
- malformed-data validation.

No preview result is persisted as a document version. Successful previews are cached in memory on the current Application Workspace. The cache key is `applicationId + document + presentationLanguage`. Failed previews are not cached. Leaving the workspace or reloading clears the cache. Saving Optimized CV or Cover Letter invalidates that document's entries for every cached Presentation Language. PDF download does not read cached preview bodies.

AI output is not guaranteed to be byte-identical across separate preview and PDF requests. Both paths must nevertheless enforce the exact same field-level contract, source snapshot rules, language, protected fields, deterministic chrome, and Language + Proficiency presentation transform. Introducing a persistent export record solely to make the two requests identical is prohibited.

### Request validation

- Validate `document` and `presentationLanguage` before loading documents or calling AI.
- Invalid `document`, missing Presentation Language, or unsupported Presentation Language returns HTTP `400`.
- The frontend must never issue separate Presentation Languages for the two package documents in one download operation.
- The backend validates each request independently and must not trust frontend storage.

## Presentation preparation pipeline

Both preview and PDF must use this pipeline:

```text
Validate request
  → authorize Application
  → load latest saved Optimized CV and Cover Letter
  → validate stored document shapes
  → select requested saved document
  → compare Presentation Language with that document's Working Language
      ├── equal and non-null: use saved content directly
      └── different or null: adapt saved narrative fields in memory
  → merge validated narrative output into a deep copy of saved content
  → resolve deterministic document chrome
  → deterministically format Cover Letter date
  → deterministically localize known Language + Proficiency labels
  → return preview view model OR render PDF
```

Loading both saved documents remains a prerequisite under the current Export specification, even when only one document is requested.

The pipeline must not invoke:

- Optimized CV generation;
- Cover Letter generation;
- Master CV extraction;
- Job Analysis generation;
- Profile Match generation;
- any repository upsert/update/delete operation.

## Exact field-level adaptation contract

### General rules

The AI receives only the narrative fields required for adaptation plus target-language instructions. Protected fields should be omitted from the AI request wherever possible.

The adaptation response must contain only the fields listed below. The server merges those fields into a deep copy of the saved document. The AI must not receive authority to return a complete replacement document.

For every adapted string:

- preserve meaning, facts, claims, tone, seniority, responsibilities, and level of detail;
- preserve omissions and uncertainty;
- preserve user edits;
- translate only as needed for natural target-language presentation;
- do not improve, optimize, summarize, expand, shorten, reorganize, or re-rank;
- do not add or remove achievements, responsibilities, technologies, facts, paragraphs, list items, or records;
- do not convert protected names or terminology;
- preserve null, empty-string, and array-position semantics.

### Optimized CV: adaptable fields

Only these fields may be returned and adapted:

```ts
interface OptimizedCvNarrativeAdaptation {
  professionalSummary: string;
  experienceDescriptions: Array<string | null>;
  educationDescriptions: Array<string | null>;
  personalProjectDescriptions: Array<string | null>;
}
```

Mapping is positional and must satisfy:

- `experienceDescriptions.length === saved.experience.length`
- `educationDescriptions.length === saved.education.length`
- `personalProjectDescriptions.length === (saved.personalProjects ?? []).length`
- each output element maps only to the `description` at the same index;
- null input descriptions must remain null;
- arrays and records must not be reordered, added, or removed.

The server merges the response only into:

- `professionalSummary`
- `experience[index].description`
- `education[index].description`
- `personalProjects[index].description`

### Optimized CV: protected fields

The following must be copied unchanged from the saved document:

- `fullName`
- `professionalTitle`
- `email`
- `phone`
- `location`
- `linkedin`
- `website`
- `experience[].jobTitle`
- `experience[].company`
- `experience[].location`
- `experience[].startDate`
- `experience[].endDate`
- `experience[].current`
- `education[].institution`
- `education[].degree`
- `education[].fieldOfStudy`
- `education[].startDate`
- `education[].endDate`
- `skills[]`
- `languages[].name`
- `languages[].proficiency`
- `certifications[].name`
- `certifications[].issuer`
- `certifications[].issueDate`
- `certifications[].credentialUrl`
- `personalProjects[].name`
- `personalProjects[].technologies`
- `personalProjects[].url`
- `profilePhotoAssetId`
- `profilePhotoPositionX`
- `profilePhotoPositionY`
- `workingLanguage`

This intentionally means that verifiable terms such as job titles, degrees, and skills retain their saved spelling even when Presentation Language differs.

`languages[].name` and `languages[].proficiency` remain AI-protected: adaptation must not translate them, and stored values stay unchanged. After merge, presentation may remap known ES/EN/FR labels through the server document-localization catalog. Unknown values pass through unchanged.

### Cover Letter: adaptable fields

Only these fields may be returned and adapted:

```ts
interface CoverLetterNarrativeAdaptation {
  greeting: string;
  introduction: string;
  professionalValue: string;
  motivation: string;
  closing: string;
}
```

The server merges the response only into:

- `greeting`
- `introduction`
- `professionalValue`
- `motivation`
- `closing`

Paragraph count and field boundaries must remain unchanged.

### Cover Letter: protected and deterministic fields

The following must be copied unchanged from the saved document:

- `candidateName`
- `email`
- `phone`
- `companyName`
- `signature`
- `workingLanguage`

The AI must not return or translate `date`. The saved date's calendar value is preserved and formatted deterministically for Presentation Language.

## Adaptation validation

Before merge or render, the backend must validate:

- exact response object keys;
- required strings and nullable values;
- array lengths;
- positional null preservation;
- absence of additional records or fields;
- unchanged protected fields by construction;
- resulting document against the existing document schema;
- no mutation of the loaded source object.

Invalid AI output is an adaptation failure. The service may use the project's existing bounded structured-output retry behavior if one exists, but must not fall back to generation or render a partially adapted document.

Adaptation should use deterministic model settings supported by the existing AI integration. No model setting can relax server-side validation.

## Deterministic document localization

### Catalog ownership

Document chrome must have one deterministic server-side source, separate from general web-interface messages.

The safest fit for the current architecture is:

- an API document-localization module owns supported document chrome by locale;
- document preparation services resolve a typed chrome object from that module;
- PDF renderers receive the resolved chrome object;
- Export Preview receives the same resolved chrome object in its API response;
- browser preview components render the provided document chrome rather than independently looking up general UI messages.

This avoids:

- importing browser-specific i18n infrastructure into the API;
- maintaining separate web and PDF document catalogs;
- adding a new package or localization dependency solely for this feature.

General Export controls and surrounding application interface continue to use the existing web `messages.ts` catalog.

### Optimized CV chrome

The typed chrome contract must include every static string currently rendered in the document:

```ts
interface OptimizedCvDocumentChrome {
  professionalSummary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  certifications: string;
  personalProjects: string;
  present: string;
  openProject: string;
}
```

All values must be provided for `es`, `en`, and `fr`. No PDF renderer fallback to English is permitted after request validation.

### Cover Letter chrome and date

The current Cover Letter has no section-title chrome. Its deterministic contract must still carry the Presentation Language and formatted date:

```ts
interface CoverLetterDocumentChrome {
  formattedDate: string;
}
```

The date formatter must:

- preserve the calendar date represented by the saved Cover Letter;
- use an explicit locale mapping rather than environment defaults;
- produce deterministic long-form output equivalent to:
  - `es`: `7 de agosto de 2026`
  - `en`: `August 7, 2026`
  - `fr`: `7 août 2026`
- use a fixed time-zone/calendar strategy so server location cannot shift the day;
- never use AI.

For newly generated Cover Letters, the service should retain an unambiguous ISO calendar date (`YYYY-MM-DD`) in `date` and format it for workspace display according to Working Language and for Export according to Presentation Language.

Legacy date values may be normalized only when they can be parsed unambiguously under the existing English long-date format or ISO date format. An ambiguous or malformed date must fail preview/export; it must not be guessed or rewritten in persistence.

### Language + Proficiency labels

Language names and proficiency labels are a presentation-only transform in the same server document-localization module. They are not document chrome and must not be produced by AI.

The catalog maps known values and their ES/EN/FR aliases onto Presentation Language:

- Languages: Spanish / English / French
- Proficiency: Native / Intermediate / Advanced / Basic

Matching is after trim and case fold. Unknown values pass through unchanged. Order, count, and nulls are preserved. The source array is not mutated. Preview and PDF use the same transform.

### Visual invariants

Localization must not change:

- document structure;
- page layout;
- typography;
- spacing;
- colors;
- profile-photo snapshot, crop, omission, or rendering behavior;
- project URL target behavior;
- contact layout;
- section inclusion rules;
- filename rules defined by the existing Export specification.

Only text localization, deterministic date presentation, and known Language + Proficiency label presentation change.

## Preview and PDF consistency

Preview and PDF must:

- use the same saved source version;
- use the same Presentation Language;
- use the same adaptation schema and merge rules;
- use the same server-owned document chrome;
- use the same Cover Letter date formatter;
- use the same Language + Proficiency presentation transform;
- preserve the same structure and conditional sections;
- preserve photo and project-link behavior.

The HTML preview components may remain the visual preview implementation, but Export Preview must render the presentation view model returned by the API. It must not render the ordinary saved working document when languages differ.

The ordinary Optimized CV and Cover Letter workspace components continue to use UI locale for workspace chrome and saved working content for body text.

## Error handling

All failures must leave saved working documents unchanged.

### Invalid or unsupported locale

- Missing or invalid generation `locale`: HTTP `400`; no AI call and no write.
- Missing or invalid `presentationLanguage`: HTTP `400`; no AI call and no render.
- Unsupported stored non-null Working Language: treat as malformed stored data; do not assume a fallback.

### Missing saved documents

Preserve the existing Export prerequisite:

- If either saved Optimized CV or saved Cover Letter is missing, preview/export returns HTTP `400`.
- No AI call or PDF render occurs.
- The UI explains that both saved documents are required.

### Malformed stored document data

- Return a non-success response before adaptation/render.
- Do not attempt to repair or persist stored data during Export.
- Do not send malformed data to AI.
- Do not fall back to Master CV or another application record.
- Log only safe diagnostics; do not log sensitive document content.

### Adaptation AI failure

- Return HTTP `502` with a stable application error code/message suitable for localization by the frontend.
- Do not render the saved document in the wrong language.
- Do not generate from Master CV.
- Do not persist partial or complete adaptation output.
- The user may retry without any document mutation.

### Partial adaptation failure

Within one document request, adaptation is atomic:

- any missing/invalid field fails the whole request;
- no partially adapted preview or PDF is returned;
- no mixed Working/Presentation Language fallback is shown as final.

Across the two independent PDF requests:

- the frontend must send the same Presentation Language;
- downloads are sequential (Optimized CV, then Cover Letter when both are selected) and stop on the first failure;
- later documents must not start after a failure;
- if more than one document was selected, the UI must say the package is incomplete and name the failed document;
- if only one document was selected, the UI must name that document only;
- user-facing copy must be localized for `es`, `en`, and `fr`; the raw English API message must not be shown;
- it must not retry using another language or unadapted content;
- retry is user-initiated, uses the same Presentation Language, and reloads the latest saved documents;
- a PDF already downloaded by the browser cannot be revoked, but the failed document remains retryable from its original saved source.

### Rendering failure

- Return a non-success response.
- Do not persist presentation data.
- Do not retry through generation.

## Security and privacy

- Existing authentication and application ownership checks apply to preview and PDF.
- AI adaptation must receive the minimum narrative content needed by the field-level contract.
- Protected identity and contact fields should not be sent to adaptation AI.
- URLs, profile-photo data, and filename-only Master CV fields must not be included in adaptation prompts.
- Existing rules against logging personal or sensitive document content remain in force.

## Acceptance criteria

### Language separation

- UI locale, original job language, Working Language, and Presentation Language are independently represented and cannot override one another implicitly.
- `JobOffer.originalDescription` remains unchanged through all generation, preview, and export flows.
- Changing UI locale does not mutate or regenerate saved Optimized CV or Cover Letter data.
- One Presentation Language applies to every selected document in the application package.

### Generation and persistence

- Each generation endpoint accepts and validates `locale`.
- The validated locale reaches Job Analysis, Profile Match, Optimized CV, and Cover Letter AI generation.
- New Optimized CV and Cover Letter drafts return the generation locale as Working Language.
- Save persists Working Language with the document.
- Manual edits remain the content used by subsequent Export.
- Existing rows return `workingLanguage: null` and are not silently backfilled.

### Export

- Export loads the latest saved documents.
- Export never invokes Optimized CV or Cover Letter generation.
- Export never uses Master CV as body-content source.
- Equal, non-null Working Language and Presentation Language skips adaptation AI.
- Different languages adapt only the saved narrative fields in memory.
- Unknown legacy Working Language follows the explicit legacy adaptation strategy.
- Protected fields remain exactly equal to their saved values, except known Language + Proficiency labels which may be remapped for presentation only.
- Adapted data is never persisted.
- Re-exporting another language starts again from the original saved document.
- Failed export leaves all saved data unchanged.

### Localization and rendering

- Export Preview uses Presentation Language independently from UI locale.
- PDF and preview use the same server-owned localized document chrome.
- All Optimized CV section labels, `Present`, and `Open project` match Presentation Language.
- Known Language + Proficiency labels follow Presentation Language in Preview and PDF; stored document data is unchanged; unknown values pass through.
- Cover Letter date is deterministically formatted for Presentation Language.
- AI never translates static document chrome, dates, or Language + Proficiency labels.
- Existing layout, typography, spacing, photo, link, and structure behavior remain unchanged.

## Test strategy

### Generation tests

Add controller/service tests proving:

- `es`, `en`, and `fr` are accepted on each generation endpoint;
- missing and unsupported locales return `400` before AI;
- UI locale reaches Job Analysis generation;
- UI locale reaches Profile Match generation;
- UI locale reaches Optimized CV generation;
- UI locale reaches Cover Letter generation;
- original job content passed to analysis remains unchanged;
- generated Optimized CV and Cover Letter responses carry the request locale as Working Language.

Add frontend service/component tests proving the active UI locale is sent for all four generation requests.

### Persistence tests

Prove:

- Working Language is persisted with Optimized CV;
- Working Language is persisted with Cover Letter;
- UI locale changes between generation and Save do not relabel the draft;
- saving manual edits preserves Working Language;
- saving a newly generated draft under another locale changes Working Language only through explicit Save;
- legacy null rows load without default substitution;
- saving unchanged legacy text does not stamp current UI locale;
- user-edited narrative fields remain the saved Export source.

### Export service tests

Prove:

- the latest saved content is passed to presentation preparation;
- Master CV is never used for body generation;
- Optimized CV and Cover Letter generation services are never called;
- equal known languages skip adaptation;
- different languages call the targeted adapter with saved narrative content only;
- legacy null Working Language uses the adaptation path;
- adapted content is not passed to repository writes;
- re-export ES, FR, then EN always starts from the same saved source;
- one frontend package operation sends one Presentation Language for both documents;
- protected values are unchanged after merge;
- malformed or structurally different AI output fails atomically;
- adaptation failure does not render or persist;
- missing documents prevent adaptation and rendering;
- invalid Presentation Language prevents loading, adaptation, and rendering.

### Field-contract tests

For Optimized CV, assert only:

- professional summary;
- experience descriptions;
- education descriptions;
- personal project descriptions

can differ from saved content.

Assert all protected Optimized CV fields remain deeply equal after adaptation and all arrays retain their lengths and order. These assertions apply to the adaptation merge. After merge, presentation may remap known Language + Proficiency labels without mutating stored data.

For Cover Letter, assert only:

- greeting;
- introduction;
- professional value;
- motivation;
- closing

can differ. Assert candidate identity, contact details, company, signature, and Working Language remain deeply equal.

### Localization tests

For every supported locale, prove:

- all Optimized CV chrome keys resolve with no fallback;
- PDF text contains the expected localized section titles;
- current-role label matches Presentation Language;
- project link label matches Presentation Language;
- Cover Letter date matches the deterministic locale format;
- original job text is unchanged;
- protected names, skills, technologies, URLs, and contact fields are unchanged;
- stored Language + Proficiency values are unchanged by adaptation; presentation may differ for known labels;
- narrative fields are adapted when required.

Add coverage for:

- cache key, workspace lifetime, and save invalidation;
- sequential package stop;
- localized partial-failure copy;
- retry keeps Presentation Language;
- Export uses saved documents only.

### Preview/PDF integration tests

Prove:

- UI ES + Working ES + Presentation ES;
- UI ES + Working ES + Presentation EN;
- UI ES + Working ES + Presentation FR;
- UI EN + Working EN + Presentation ES;
- UI FR + Working FR + Presentation EN;
- CV and Cover Letter with different Working Languages still share one Presentation Language;
- Export Preview follows Presentation Language while workspace interface remains in UI locale;
- preview and PDF receive the same typed chrome and presentation semantics;
- profile photo and project links behave exactly as before.

## Implementation phases

No phase may implement a later phase implicitly. Each phase must be reviewed and tested before the next phase begins.

### Phase 1 — Locale contract and generation propagation

**Objective**

Make UI locale an explicit, validated input to initial Job Analysis, Profile Match, Optimized CV, and Cover Letter generation.

**Scope**

- Server-supported locale type guard.
- Generation request body validation.
- Frontend service propagation from the existing locale context.
- AI service input/output-language contract.
- Working Language included in generated Optimized CV and Cover Letter drafts.
- Deterministic locale-aware Cover Letter draft date handling.

**Expected files/layers**

- Web locale-aware workspace components and generation service clients.
- API controllers and generation services.
- API document/domain types.
- Existing AI prompt builders, changed only as required to carry the approved locale contract.
- Generation tests.

**Dependencies**

- Existing UI i18n.
- Existing four generation flows.

**Acceptance criteria**

- All four generation requests validate and propagate `es | en | fr`.
- Generated analysis/narrative output follows the requested locale.
- Original job description remains unchanged.
- Generated working-document drafts carry Working Language.

**Tests**

- Controller validation.
- AI service locale propagation.
- Frontend request bodies.
- Original-job immutability.

**Out of scope**

- Database fields.
- Saving Working Language.
- Export UI.
- Export adaptation.
- PDF chrome.
- Relocalizing already persisted Job Analysis/Profile Match results.

### Phase 2 — Working Language persistence and legacy compatibility

**Objective**

Persist the known language of saved working documents without guessing legacy rows.

**Scope**

- Prisma enum and nullable fields.
- Migration implementation in the future phase task.
- Repository mappings.
- Public/domain types.
- Save validation and persistence.
- Legacy `null` behavior.

**Expected files/layers**

- Prisma schema and migration generated only during the approved implementation task.
- Optimized CV and Cover Letter repositories/services/controllers.
- Web document types and draft/save state.
- Persistence tests.

**Dependencies**

- Phase 1 generated draft metadata.

**Acceptance criteria**

- Every newly saved document has non-null Working Language.
- Legacy rows remain null and are not inferred or backfilled.
- UI locale changes do not relabel drafts or saved documents.
- Explicitly saving a new generated draft can replace Working Language.

**Tests**

- Repository round trips.
- Save validation.
- legacy-null reads.
- generation/switch-locale/save flow.

**Out of scope**

- Presentation Language.
- Export adaptation.
- Document chrome localization.
- Any bulk legacy-language inference.

### Phase 3 — Presentation Language contract and Export UX

**Objective**

Introduce one export-time Presentation Language for the complete package and establish preview/PDF request contracts.

**Scope**

- Export language selector.
- Clear complete-package explanation.
- PDF and preview request validation.
- Frontend propagation of one selection to both document requests.
- Preview loading/error states.
- Optional browser-only preference.
- Typed preview response shell.

**Expected files/layers**

- `ApplicationExport` and export frontend service/types.
- Export controller/service request validation.
- Preview route/controller.
- API route and integration tests.
- Web messages for Export controls.

**Dependencies**

- Phase 2 Working Language read contract.

**Acceptance criteria**

- Presentation Language appears only in Export.
- All supported language combinations can be selected.
- The same value is used for CV and Cover Letter.
- Invalid values fail before document preparation.
- Selection does not mutate saved data.

**Tests**

- Selector behavior.
- package propagation.
- validation.
- browser preference validation.
- independence from UI locale.

**Out of scope**

- AI adaptation.
- Localized PDF chrome.
- Visual redesign.
- Persistent export records.

### Phase 4 — Targeted in-memory adaptation

**Objective**

Adapt only saved narrative content when Presentation Language differs or Working Language is unknown.

**Scope**

- Dedicated adaptation service.
- Exact Optimized CV and Cover Letter response schemas.
- Protected-field-by-construction merge.
- Same-language bypass.
- Legacy-null path.
- Atomic validation and error mapping.
- Shared presentation preparation service used by preview and PDF.

**Expected files/layers**

- API adaptation and presentation preparation services.
- Structured AI response validators.
- Export service integration.
- Unit and integration tests.

**Dependencies**

- Phase 2 Working Language.
- Phase 3 request contracts.

**Acceptance criteria**

- Adaptation starts only from latest saved documents.
- Same known language makes no AI call.
- Only approved narrative fields can change.
- No adapted output is persisted.
- Every re-export starts from the saved source.
- Generation services are never called.

**Tests**

- Field-level merge and protection.
- same-language bypass.
- legacy path.
- no repository writes.
- no generation calls.
- malformed output and AI failure.

**Out of scope**

- Content improvement.
- Master CV conversion.
- Static chrome translation by AI.
- Export result persistence.

### Phase 5 — Deterministic document chrome and Cover Letter dates

**Objective**

Make all generated document chrome, Cover Letter date formatting, and known Language + Proficiency labels follow Presentation Language.

**Scope**

- Server-owned document chrome catalog.
- Typed chrome contracts.
- Optimized CV renderer parameters for all identified static strings.
- Preview consumption of server-resolved chrome.
- Deterministic Cover Letter date parsing/formatting.
- Workspace date formatting from Working Language for new ISO date values.
- Deterministic Language + Proficiency presentation localization for known ES/EN/FR values, shared by Preview and PDF.

**Expected files/layers**

- API document-localization module.
- PDF document components and helpers.
- Presentation view models.
- Web preview document props.
- Rendering and localization tests.

**Dependencies**

- Phase 3 preview contract.
- Phase 4 presentation preparation service.

**Acceptance criteria**

- Every chrome string resolves for all locales.
- AI is not used for chrome, dates, or Language + Proficiency labels.
- Preview and PDF receive the same chrome.
- Known Language + Proficiency labels are remapped for presentation only; stored values are unchanged; unknown values pass through.
- Date examples match the approved output.
- Layout, photo, links, and structure are unchanged.

**Tests**

- Catalog completeness.
- PDF text extraction.
- preview props.
- date formatting/time-zone boundaries.
- Language + Proficiency presentation mapping and pass-through.
- visual regression where available.

**Out of scope**

- General web i18n refactoring.
- New localization dependency.
- Filename localization.
- Visual redesign.

### Phase 6 — Preview/PDF integration and final safeguards

**Objective**

Complete the end-to-end package flow and verify consistency, failure isolation, and non-mutation.

**Scope**

- Workspace-scoped in-memory preview cache keyed by `applicationId + document + presentationLanguage`.
- Successful previews cached; failed previews not cached; save invalidates that document; leave/reload clears the cache.
- Download integration for one or both documents.
- Sequential package downloads that stop on first failure.
- Localized partial-failure UX for `es`, `en`, and `fr`.
- End-to-end language combinations.
- Regression coverage for saved edits, photos, links, and filenames.
- Assertions that Export uses latest saved documents only and that no persistence or generation occurs during preview/export.

**Expected files/layers**

- Export UI and service integration.
- API export/preview integration tests.
- End-to-end or component integration tests.
- Existing document rendering test suites.

**Dependencies**

- Phases 1–5.

**Acceptance criteria**

- Preview and PDFs use Presentation Language.
- Both documents share one Presentation Language.
- User edits remain authoritative.
- Re-export does not create translation chains.
- Failed operations do not mutate data.
- Retry uses the same Presentation Language and latest saved documents.
- Existing visual and download behavior remains intact.

**Tests**

- All approved UI/Working/Presentation Language combinations.
- Preview/PDF contract consistency, including Language + Proficiency presentation.
- cache key, coexistence, save invalidation, and workspace lifetime.
- sequential package stop and localized partial failure.
- no generation/no persistence spies.
- latest saved documents only; no unsaved editor state.
- legacy records.
- photo/project-link regressions.

**Out of scope**

- ZIP export.
- persistent prepared-export snapshots.
- unrelated workflow or design changes.

## Explicitly out of scope

- Automatic detection of the user's desired Presentation Language.
- Automatic selection based on original job language.
- Automatic selection based on company country.
- Independent language selection for Optimized CV and Cover Letter.
- Translation or rewriting of `JobOffer.originalDescription`.
- Master CV language conversion.
- Mutation of Master CV during generation or Export.
- Automatic mutation or regeneration of existing working documents after UI locale changes.
- Full Optimized CV or Cover Letter regeneration during Export.
- Regeneration from Master CV during Export.
- Translation chains between presentation outputs.
- Persisting adapted preview/export content.
- Persistent export-version records.
- Persisting Presentation Language as document truth.
- AI translation of static document chrome or dates.
- Translation of protected identity/verifiable fields.
- Filename localization.
- New document formats, ZIP export, email, or sharing.
- Unrelated visual redesign.

## Unresolved product decision

### Existing persisted Job Analysis and Profile Match after UI locale changes

Current Job Analysis and Profile Match results are persisted and reused, but their generation locale is not stored. The approved decisions establish that UI locale controls these outputs, while only saved Optimized CV and Cover Letter are explicitly protected from silent regeneration after a UI locale change.

The product must decide what happens when a user changes UI locale after Job Analysis or Profile Match already exists:

1. keep the existing persisted result in its original generated language;
2. explicitly regenerate it in the new UI locale;
3. adapt it for display without replacing the persisted result.

This specification does not select among those behaviors. Phase 1 may propagate locale for newly created results, but implementation of locale changes for already persisted Job Analysis/Profile Match must wait for this decision. No implementation may silently regenerate, overwrite, or infer the language of those existing records.

## Validation checklist

- [x] UI locale, original job language, Working Language, and Presentation Language are distinct.
- [x] Original job content remains unchanged.
- [x] Export never regenerates from Master CV.
- [x] Latest saved user edits are authoritative.
- [x] One Presentation Language applies to Optimized CV + Cover Letter.
- [x] Adapted exports are request-scoped and never persisted.
- [x] Every target export starts from the saved working document.
- [x] Exact adaptable and protected fields are defined.
- [x] Static chrome, Cover Letter dates, and known Language + Proficiency labels are deterministic.
- [x] Preview and PDF share one presentation preparation contract.
- [x] Legacy records do not receive an assumed language.
- [x] Error behavior fails safely without document mutation.
- [x] Implementation phases are dependency-ordered and independently testable.
- [x] Unresolved product behavior is identified rather than invented.
