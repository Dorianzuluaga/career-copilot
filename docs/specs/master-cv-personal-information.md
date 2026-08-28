# Feature Specification

## Feature Information

**Feature Name**

Master CV Personal Information and CV Header Redesign

**Status**

Draft

**Priority**

High

---

# Purpose

Close the gap between the Master CV data model and the already specified Export filename field `professionalTitle`, and replace the single wrapping contact line on the Optimized CV with a structured header.

The current Personal Information model has no professional title. Export already requires optional Master CV `professionalTitle` for Optimized CV filenames. The current header concatenates every present contact value into one line, which wraps mid-URL on A4.

Expected outcome:

- Users can store an optional professional title on the Master CV.
- The former Portfolio field becomes a generic Website field without losing saved values.
- Optimized CV preview and PDF render the same structured header.
- Empty optional fields occupy no space.
- Cover Letter header and application workflow behavior stay unchanged.

This specification amends Personal Information and CV header rendering only. It does not change Job Analysis, Profile Match, Cover Letter generation, or Export workflow rules.

---

# Relationship with Existing Specifications

This specification extends:

- `docs/specs/master-cv-onboarding.md`
- `docs/specs/optimized-cv.md`
- `docs/specs/export.md`

Preserve those documents' terminology and architecture:

- Master CV is the single source of truth.
- Personal information is protected Master CV data.
- Optimized CV copies Personal Information from the Master CV and never invents it.
- Users cannot edit Personal Information inside the Optimized CV.
- Export renders the latest saved Optimized CV for the document body.
- Export filenames read `fullName` and optional `professionalTitle` from the Master CV.
- Preview must match the generated PDF.
- Empty optional values persist as `null`.
- Unknown extracted values must be `null`. The AI must never invent information.

Where this specification conflicts with those documents on Personal Information fields or CV header rendering, this specification has priority until those documents are updated after approval.

---

# Dependencies

- Master CV Onboarding
- Optimized CV
- Export
- Existing locale support (English, Spanish, French)

---

# Context Required

Load only:

- Product DNA
- Optimized CV product documentation
- Export product documentation
- Master CV Onboarding specification
- Optimized CV specification
- Export specification
- Cover Letter specification (header must remain unchanged)
- AI Engineering Guide
- Project Rules
- Development Guide
- This specification

---

# User Workflow

1. User opens the Master CV editor (onboarding or existing-user editor).
2. User sees Personal Information fields in document order, including optional Professional title and Website or professional profile.
3. User enters or reviews values. Empty optional fields remain editable in the form.
4. If the user uploads a CV, extraction may prefill the new fields only when they are present in the source document.
5. User saves the Master CV.
6. User generates or regenerates an Optimized CV for an Application Workspace.
7. The Optimized CV copies Personal Information from the Master CV, including `professionalTitle` and `website`.
8. User reviews the Optimized CV header. Empty optional fields are absent.
9. User previews and downloads the Optimized CV from Export. Preview and PDF use the same header structure.
10. Cover Letter preview and PDF continue to show name plus email and phone only.

---

# Data Model

Personal Information belongs to the Master CV and is copied onto each Optimized CV.

`professionalTitle` is distinct from Experience `jobTitle`. It is the candidate headline shown under the full name. It is not an employment record.

`website` is distinct from `linkedin`. LinkedIn remains its own field. `website` stores one optional URL for a personal website or other professional profile (portfolio, GitHub, Behance, or similar).

## Fields

| Field | Required | Type | Empty persistence | Notes |
|---|---|---|---|---|
| `fullName` | Yes | string | Not empty | Unchanged. |
| `professionalTitle` | No | string or null | `null` | New. Same empty handling as `location`. |
| `email` | Yes | string | Not empty | Unchanged. |
| `phone` | No | string or null | `null` | Unchanged. |
| `location` | No | string or null | `null` | Unchanged. |
| `linkedin` | No | string or null | `null` | Unchanged. URL-validated. |
| `website` | No | string or null | `null` | Replaces `portfolio`. URL-validated. |

The public JSON and API shape uses `website`. After this change, `portfolio` is not a field name.

The Optimized CV continues to use the Master CV input shape. Adding these fields to the Master CV adds them to the Optimized CV.

Required Master CV fields remain:

- Full Name
- Email
- Professional Summary
- Experience
- Skills

Optional Master CV fields become:

- Professional Title
- Phone
- Location
- LinkedIn
- Website
- Education
- Languages
- Certifications
- Personal Projects

Only one Master CV exists per authenticated user.

Existing APIs remain:

```
GET    /api/master-cv
POST   /api/master-cv
PUT    /api/master-cv
POST   /api/master-cv/upload
```

No new routes.

---

# Migration Strategy

Rename the existing database column `portfolio` to `website` on both Master CV and Optimized CV storage.

The rename must preserve existing values. Do not copy, transform, or clear saved URLs.

Add nullable `professionalTitle` to both Master CV and Optimized CV storage.

Do not backfill `professionalTitle` from Experience `jobTitle`, Professional Summary, or any other field.

After migration:

- Existing Master CV and Optimized CV rows keep their former portfolio URLs in `website`.
- Existing rows have `professionalTitle` as empty (`null`).
- Saved Optimized CVs are snapshots. Updating the Master CV later does not rewrite an already saved Optimized CV.
- Export document body continues to use the saved Optimized CV. Export must not read Master CV Personal Information to fill the CV header.
- Export filenames continue to use Master CV `fullName` and Master CV `professionalTitle`, including the existing empty-title fallback.

---

# User Workflow Details

## Master CV Editor

The Personal Information section remains a labeled form, not a document preview.

Form fields stay visible when empty so the user can fill them. The omit-when-empty rule applies only to Optimized CV preview and PDF rendering.

Field order in the Personal Information section:

1. Full name
2. Professional title
3. Phone
4. Email
5. Location
6. LinkedIn
7. Website or professional profile

The section may keep a two-column editor. Order must follow the list above. Website uses the same URL input pattern as LinkedIn.

Visible Website label, in English:

Website or professional profile

LinkedIn label remains "LinkedIn".

Professional title is optional. Saving with an empty professional title stores `null`.

## Optimized CV

Personal Information, including `professionalTitle` and `website`, remains read-only.

Changes to these fields must be made in the Master CV.

Generating an Optimized CV copies the current Master CV Personal Information into the Optimized CV.

A later Master CV edit does not change a previously saved Optimized CV until the user generates and saves a new Optimized CV.

## Export

Export behavior is unchanged except that the Optimized CV header rendering follows this specification.

Filenames already specified in the Export specification become able to include `professionalTitle` once that field exists on the Master CV.

---

# Functional Requirements

- The Master CV stores optional `professionalTitle`.
- The Master CV stores optional `website` in place of `portfolio`.
- Existing `portfolio` values remain available as `website` after migration.
- The Optimized CV stores the same Personal Information fields as the Master CV.
- Optimized CV generation copies `professionalTitle` and `website` from the Master CV.
- The AI must not invent, alter, or omit-by-replacement Personal Information.
- Users can edit `professionalTitle` and `website` only in the Master CV editor.
- Optimized CV preview and PDF render the structured header defined below.
- Preview and PDF use the same structural order.
- Optional header fields, icons, and rows are omitted when the corresponding value is empty.
- Cover Letter preview and PDF headers remain unchanged.
- No photo is uploaded, stored, or rendered.
- Application business logic outside the Master CV Personal Information data flow remains unchanged.

---

# Business Rules

## Presence

A value is empty when it is `null`, `""`, or whitespace only.

Empty optional values persist as `null`.

Empty optional document fields must disappear completely. The renderer must not reserve empty space, empty columns, empty rows, placeholders, or "Not provided" text.

`fullName` and `email` remain required for a valid Master CV and therefore render whenever a valid Optimized CV exists.

## Validation

- `professionalTitle` is an optional string. It uses the same empty handling as `location`. It is not URL-validated.
- `website` is an optional URL. It uses the same URL validation as `linkedin`.
- `linkedin` validation is unchanged.
- Invalid `website` values must not be saved.
- Export must never fail because `professionalTitle` is missing or empty.

## Ownership and Integrity

- Master CV remains the single source of truth for Personal Information.
- Optimized CV Personal Information is a snapshot copied from the Master CV at generation time.
- Users cannot edit Personal Information inside the Optimized CV.
- Saving an Optimized CV must not modify the Master CV.
- Saving the Master CV must not modify existing Optimized CVs.
- Export must not modify Master CV, Optimized CV, Cover Letter, or Application data.

## Header Values

Display stored values as stored. Do not strip URL schemes, rewrite URLs, or replace a field with another field's value for display.

Do not model a list of social links.

---

# UI Requirements

## Master CV Personal Information Form

- Keep the existing Personal Information section.
- Add an optional Professional title field.
- Rename the Portfolio field to Website or professional profile. The field key is `website`.
- Keep LinkedIn as a separate field.
- Do not show document header icons in the form.
- Do not show an empty-state message for unused optional Personal Information fields.

## Optimized CV Header

The header is identity content only in this phase. Structure it as a horizontal header row that can accept a future photo sibling without redesigning the identity block:

- Identity block: grows to use available width. It contains name, professional title, and contact rows. It is the only rendered header child in this phase.
- Photo region: not rendered. Do not draw an empty photo box, spacer, or reserved column.

Identity content order:

1. Full name — unchanged primary heading.
2. Professional title — secondary line directly under the name. Omit when empty.
3. Phone + Email row.
4. Location + LinkedIn row.
5. Website row.

Professional title has no icon.

Each rendered contact value has a small local SVG icon immediately before the value.

Icon assignment:

- Phone: phone
- Email: envelope
- Location: location pin
- LinkedIn: LinkedIn mark
- Website: generic globe or link. Not a network-specific icon.

Icons are decorative. They do not replace the visible value. They must not introduce a new icon library or other dependency. Preview and PDF must use the same icon artwork.

### Pair rows

Phone + Email:

- If both are present, they appear on one row as two independent items.
- If only one is present, the row contains only that item, left-aligned.
- If both are empty, the row is omitted. For a valid Optimized CV, email is present.

Location + LinkedIn:

- Same pairing rules as Phone + Email.
- If both are empty, the row is omitted.

Website:

- If present, it appears on its own row with its icon.
- If empty, the row is omitted.

Do not concatenate contact values into a single wrapping text node.

When both items of a pair row are present, they remain independent items on that row. A visual gap or separator between the two items is allowed. Values must still wrap as separate items, not as one joined string.

## Cover Letter Header

Unchanged:

- Candidate name
- Email and phone on one line, separated as they are today, omitted independently when empty
- Date
- Company name when present

No professional title, location, LinkedIn, website, or contact icons.

---

# Rendering Rules

Preview and PDF must produce the same structural order from the same presence rules.

Presence rules:

1. Always render `fullName`.
2. Render `professionalTitle` only when it has text.
3. Render the Phone + Email row only when phone, email, or both have text. Render only the items that have text.
4. Render the Location + LinkedIn row only when location, LinkedIn, or both have text. Render only the items that have text.
5. Render the Website row only when `website` has text.

If a field is empty, its icon is not rendered.

The identity block must occupy the full header width while no photo is rendered.

Body sections, columns, typography outside the header, and page layout remain unchanged except as required to attach this header.

---

# Extraction and Integrity Rules

## AI Extraction Contract

The upload extraction JSON `personalInformation` object is:

```
{
  "fullName": "",
  "professionalTitle": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": ""
}
```

Rules:

- Unknown values must be `null`.
- Never invent information.
- Return only structured JSON.
- Extract `professionalTitle` only when the uploaded CV presents a professional headline, typically under the name.
- Do not copy an Experience `jobTitle` into `professionalTitle` unless that text is presented as the candidate's professional title independently of a specific employment entry.
- Extract `linkedin` only for LinkedIn URLs.
- Extract `website` for a personal website or other non-LinkedIn professional profile URL when present in the source document.
- If several non-LinkedIn URLs are present, extract the one presented as the candidate's website or portfolio. Do not invent a URL. Do not concatenate URLs. Do not place a LinkedIn URL in `website`.
- Existing extraction rules for Experience, Education, Skills, Languages, Certifications, and Personal Projects are unchanged.

## Optimized CV Integrity

When generating an Optimized CV, Personal Information must be taken from the Master CV:

- `fullName`
- `professionalTitle`
- `email`
- `phone`
- `location`
- `linkedin`
- `website`

The AI may not:

- Invent a professional title.
- Invent a website.
- Alter Personal Information.
- Replace Master CV Personal Information with generated values.

If the Master CV field is empty, the Optimized CV field is empty.

---

# Validation

Frontend and backend must apply the same rules before save.

| Field | Rule |
|---|---|
| `fullName` | Required. Unchanged. |
| `email` | Required, valid email. Unchanged. |
| `professionalTitle` | Optional. Trimmed empty becomes `null`. No format constraint beyond optional string. |
| `phone` | Optional, valid phone when present. Unchanged. |
| `location` | Optional string. Unchanged. |
| `linkedin` | Optional, valid URL when present. Unchanged. |
| `website` | Optional, valid URL when present. Same URL rule as `linkedin`. |

Validation toasts and invalid-field focus must recognize `professionalTitle` and `website`. They must not refer to `portfolio`.

---

# Internationalization

Use the existing English, Spanish, and French message catalogs.

Replace Portfolio keys with Website keys. Add Professional title keys.

English visible strings:

| Key purpose | English |
|---|---|
| Professional title label | Professional title |
| Website label | Website or professional profile |

Spanish:

| Key purpose | Spanish |
|---|---|
| Professional title label | Título profesional |
| Website label | Sitio web o perfil profesional |

French:

| Key purpose | French |
|---|---|
| Professional title label | Titre professionnel |
| Website label | Site web ou profil professionnel |

LinkedIn labels remain "LinkedIn" in all locales.

Reuse the existing invalid-URL message for `website`. Do not add a new validation sentence unless the existing URL message cannot be reused.

Toast and navigation field names must use the same visible labels as the form.

---

# Technical Notes

- Reuse existing Master CV, Optimized CV, and Export architecture.
- Reuse existing optional-value persistence (`null` for empty optional fields).
- Reuse existing URL validation for `website`.
- Reuse existing Master CV integrity enforcement to copy Personal Information onto the Optimized CV.
- The Optimized CV type remains the Master CV input shape.
- Preview and PDF cannot share document components, but they must share the same header presence rules so their structural order cannot diverge.
- Use small local SVG icons. Do not add an icon library or other new dependency.
- Rename the database column `portfolio` to `website` on Master CV and Optimized CV storage. Do not drop and recreate the column.
- Do not add API routes.
- Do not change Cover Letter rendering.
- Do not change application workflow, Job Analysis, Profile Match, or Export selection/download behavior.
- After approval, update `docs/specs/master-cv-onboarding.md`, `docs/specs/optimized-cv.md`, and `docs/specs/export.md` so they no longer mention `portfolio` and they include `professionalTitle` on the Master CV schema.

---

# AI Considerations

AI is involved only in Master CV extraction and Optimized CV generation.

Expected input for extraction: the uploaded CV PDF, processed temporarily and deleted after extraction.

Expected output for extraction: structured JSON including `personalInformation.professionalTitle` and `personalInformation.website`.

Context requirements: extract only what the source document contains.

Validation rules: unknown values are `null`. Never invent a professional title or website.

Token optimization: do not add a list of social networks or photo-related fields to the extraction contract.

---

# Acceptance Criteria

### AC1 — Optional professional title on Master CV

Given a user is editing the Master CV

When they enter a professional title and save

Then the Master CV persists `professionalTitle`

And the value is available to later Optimized CV generation and Export filenames.

### AC2 — Empty professional title

Given a user leaves Professional title empty

When they save the Master CV

Then `professionalTitle` is stored as `null`

And Optimized CV preview and PDF omit the professional title line completely.

### AC3 — Website replaces portfolio

Given a Master CV or Optimized CV that stored a portfolio URL

When the migration runs

Then that URL is available as `website`

And `portfolio` is no longer part of the data model, API, or form.

### AC4 — Website label

Given the Master CV Personal Information form in English

When the form is displayed

Then the former Portfolio field is labeled "Website or professional profile"

And LinkedIn remains a separate field labeled "LinkedIn".

### AC5 — Website validation

Given a user enters an invalid URL in Website or professional profile

When they save the Master CV

Then the save is rejected with the existing invalid-URL validation behavior.

### AC6 — Header order

Given an Optimized CV with full name, professional title, phone, email, location, LinkedIn, and website

When preview or PDF is rendered

Then the header order is:

1. Full name
2. Professional title
3. Phone and email on one row
4. Location and LinkedIn on one row
5. Website on its own row

### AC7 — Omit empty optional fields

Given an Optimized CV with full name and email only

When preview or PDF is rendered

Then professional title, phone, location, LinkedIn, and website are absent

And no empty row, empty column, icon-only cell, or reserved space appears for those fields.

### AC8 — Partial pair row

Given phone is empty and email is present, and location is present and LinkedIn is empty

When preview or PDF is rendered

Then the Phone + Email row contains only email, left-aligned

And the Location + LinkedIn row contains only location, left-aligned

And neither row reserves an empty second cell.

### AC9 — Preview matches PDF structure

Given any saved Optimized CV

When the user views Export preview and downloads the Optimized CV PDF

Then both documents use the same header structural order and the same omit-when-empty rules.

### AC10 — Icons

Given a rendered contact value

When preview or PDF shows that value

Then a small local SVG icon appears with the value

And no new icon dependency is introduced

And empty fields have no icon.

### AC11 — Protected Personal Information

Given a generated Optimized CV

When the user reviews or edits it

Then `professionalTitle` and `website` are read-only

And changing them requires editing the Master CV.

### AC12 — Integrity copy

Given a Master CV with a professional title and website

When an Optimized CV is generated

Then the Optimized CV contains those exact Master CV values

And the AI output cannot replace them.

### AC13 — Extraction does not invent

Given an uploaded CV with no professional title and no website

When extraction completes

Then `professionalTitle` and `website` are `null`

And extraction does not copy an Experience job title into `professionalTitle`.

### AC14 — Saved snapshot is not backfilled on export

Given a saved Optimized CV with empty `professionalTitle`

And a Master CV that later has a professional title

When the user exports the Optimized CV without generating a new Optimized CV

Then the PDF header omits professional title

And the filename may still use the Master CV `professionalTitle` according to the Export specification.

### AC15 — Cover Letter unchanged

Given a saved Cover Letter

When preview or PDF is rendered

Then the header remains candidate name, email and phone, date, and company name when present

And it does not show professional title, location, LinkedIn, website, or contact icons.

### AC16 — No photo

Given any Master CV or Optimized CV

When the user edits, previews, or exports

Then no photo upload control or photo rendering is present

And the header does not reserve an empty photo box.

### AC17 — Future photo structure

Given the Optimized CV header with no photo

When it is rendered

Then the identity block is the only header child and uses the available header width

And the layout can accept a future fixed-size photo sibling without changing the identity content order.

### AC18 — Export filename fallback

Given a Master CV with no professional title

When the user downloads the Optimized CV

Then the filename uses the existing Export fallback `{candidate-name}_cv.pdf`

And export succeeds.

### AC19 — Application workflow unchanged

Given an existing Application Workspace

When this feature is implemented

Then Job Analysis, Profile Match, Cover Letter generation, workspace routing, and Export selection/download behavior remain unchanged except for the Master CV Personal Information data flow required by this specification.

### AC20 — Locales

Given the Master CV form in Spanish or French

When Personal Information is displayed

Then Professional title and Website or professional profile use the locale strings defined in this specification

And LinkedIn remains "LinkedIn".

---

# Tests

Update existing Master CV and Optimized CV fixtures that still use `portfolio`.

Update:

- Master CV and Optimized CV types and empty onboarding state
- Master CV validation and invalid-field navigation
- i18n key lists
- Extraction schema guards
- Optimized CV integrity copying for `professionalTitle` and `website`
- Export filename tests still read Master CV `professionalTitle` and still fall back when it is empty

Add:

- Migration: former `portfolio` values round-trip as `website`
- Optional `professionalTitle` persists and copies to the Optimized CV
- Empty `professionalTitle` and empty `website` are omitted from preview and PDF
- Header order: name, title, phone+email, location+LinkedIn, website
- Partial pair rows do not reserve an empty second cell
- Website row appears only when `website` has text
- Extraction leaves `professionalTitle` and `website` null when the source document has no such values
- Integrity rejects invented Personal Information by always copying from the Master CV
- Cover Letter header fixtures remain name plus email and phone
- Preview and PDF structural order stay aligned

Use existing document-rendering tests and Optimized CV preview markup tests. This specification does not introduce browser end-to-end tests.

---

# Out of Scope

Do not implement:

- Photo upload, storage, cropping, or rendering
- An empty photo placeholder
- Multiple websites or a list of social links
- Merging LinkedIn into `website`
- Clickable header links beyond displaying the stored value
- Rewriting or shortening displayed URLs
- Cover Letter header changes
- Cover Letter professional title, location, LinkedIn, website, or icons
- Style Profile or document themes
- Custom templates
- User-defined filenames
- Backfilling `professionalTitle` onto existing saved Optimized CVs during Export
- Updating saved Optimized CVs when the Master CV changes
- Job Analysis changes
- Profile Match changes
- Cover Letter generation changes
- New API routes
- New icon libraries or other new dependencies
- AI-generated professional titles
- AI-generated websites
- LinkedIn import
- Application workflow, routing, or status changes beyond the Master CV Personal Information data flow

---

# Related Documentation

- `docs/product/07-optimized-cv.md`
- `docs/product/09-export.md`
- `docs/specs/master-cv-onboarding.md`
- `docs/specs/optimized-cv.md`
- `docs/specs/export.md`
- `docs/specs/cover-letter.md`
- `docs/engineering/AI_ENGINEERING.MD`
- `docs/engineering/PROJECT_RULES.MD`
- `docs/engineering/DEVELOPMENT_GUIDE.MD`

---

# Spec Validation Checklist

- [x] User workflow completely defined.
- [x] Navigation between screens defined.
- [x] CRUD interactions defined (if applicable).
- [x] Business rules defined.
- [x] UI requirements defined.
- [x] UI placeholders defined (if applicable).
- [x] Acceptance criteria defined.
- [x] Out of scope defined.
- [x] No ambiguous requirements.

---

# Amendments After Approval

After this specification is approved, and before or during implementation, update the existing specifications as follows.

## Master CV Onboarding

In the AI extraction contract, add `professionalTitle` and replace `portfolio` with `website`.

In the optional fields list, add Professional Title and replace Portfolio with Website.

## Optimized CV

State that Personal Information includes optional `professionalTitle` and `website`.

State that those fields remain protected Master CV information and are copied during generation.

## Export

Keep filename ownership of `professionalTitle` on the Master CV.

Note that the Optimized CV header rendered by Export follows this specification, and that Export still must not read Master CV Personal Information to fill the document body.
