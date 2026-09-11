# Export Specification

## Overview

This Epic implements the Export functionality described in:

- docs/product/09-export.md

The purpose of this Epic is to allow users to preview and download the final application documents after they have saved an Optimized CV.

A Cover Letter is included only when one has been saved. Export never creates, modifies, or regenerates application documents.

Export only renders the latest saved application documents into downloadable PDF files.

---

# Routing

The Export section is accessed from the Application Workspace.

It is not a standalone page.

Users can access Export after:

- A saved Optimized CV exists.

A saved Cover Letter is not required.

No additional routes should be introduced during this Epic.

---

# Business Goal

Allow users to download professional application documents that exactly match the versions they previously reviewed and approved.

Export should always represent the latest saved application documents.

---

# User Story

As a user,

I want to preview and download my completed application documents,

so that I can confidently submit them to employers.

---

# Workflow

```text
Saved Optimized CV
        │
        ├── no Cover Letter ──► Export (Optimized CV only)
        │
        └── saved Cover Letter ──► Export (Optimized CV and Cover Letter)
                │
                ▼
            Select Documents
                │
                ▼
            Preview Selected Document
                │
                ▼
            Export PDF(s)
                │
                ▼
            Download
```

---

# Functional Requirements

## Phase 1 — Preview Documents

Display the latest saved application documents that exist.

When no Cover Letter exists, preview Optimized CV only. Cover Letter must not be shown as a selectable or previewable document.

When a Cover Letter has been saved, the preview must:

- Show one document at a time. Users may switch between document previews. This preview switcher is independent from    the document selection introduced in Phase 2.

- Match the visual layout of the generated PDF.
- Be completely read-only.

The preview is rendered directly from the saved application documents.

The Optimized CV header rendered by Export follows `docs/specs/master-cv-personal-information.md` for identity content and `docs/specs/master-cv-profile-photo.md` for the optional photo sibling. Export still must not read Master CV Personal Information, including the Master CV photo, to fill the document body. Filename ownership of `professionalTitle` remains on the Master CV.

The preview never renders or downloads PDF files.

No editing.

No downloading.

---

## Phase 2 — Document Selection

Allow users to choose which documents will be downloaded from the documents that exist.

When no Cover Letter exists, Optimized CV is the only selectable and downloadable document.

When a Cover Letter has been saved, supported selections remain:

- Optimized CV
- Cover Letter
- Both documents

Selection only affects the export process.

It never modifies the saved application documents.

---

## Phase 3 — Export PDFs

Generate downloadable PDF files from the latest saved application documents.

PDF generation starts only after users explicitly click **Download**.

The backend is responsible for rendering PDF files.

The frontend is responsible for requesting the export and handling the download.

PDF generation must never modify:

- Optimized CV
- Cover Letter, when one exists
- Application data

PDF files are temporary renderings.

They are never permanently stored.

### Export API

```http
POST /api/applications/:id/export
Content-Type: application/json

{
  "document": "optimized-cv" | "cover-letter"
}
```

Each request returns one `application/pdf` response with a `Content-Disposition` filename.

The frontend performs one request per selected document.

A `document` value of `"cover-letter"` is valid only when a saved Cover Letter exists. CV-only preview and export must not send a Cover Letter request and must not load a Cover Letter.

### Filename Rules

Filenames are generated from the user's Master CV `fullName`.

Slugification:

- lowercase
- remove accents
- replace whitespace with `-`
- remove unsupported non-alphanumeric characters

Optimized CV:

```
{candidate-name}_{professional-title}_cv.pdf
```

`professionalTitle` is owned by the Master CV. If the field is missing or empty, use:

```
{candidate-name}_cv.pdf
```

Export must never fail because of a missing professional title.

Cover Letter:

```
{candidate-name}_cover-letter.pdf
```

---

# Export Validation

Before generating an Optimized CV PDF, the backend must verify that a saved Optimized CV exists.

The CV-only pipeline must not require or load a Cover Letter. It must not call Cover Letter generation or Cover Letter presentation/adaptation AI.

Before generating a Cover Letter PDF, the backend must verify that a saved Cover Letter exists.

If the requested document is missing, PDF generation must be rejected.

A missing Cover Letter must not reject Optimized CV preview or PDF generation.

The frontend should display the corresponding error state.

---

## UI Requirements

The Export section must:

- Preserve the current Application context.
- Display one document preview at a time.
- Show Cover Letter as a previewable or selectable document only when a Cover Letter has been saved.
- Clearly indicate the currently selected document.
- Clearly indicate which documents will be downloaded.
- Keep the preview read-only.
- Never expose editing controls.
- Follow the responsibilities defined in:
  - docs/product/09-export.md

---

# Architecture Principle

Export separates document presentation from document rendering.

The frontend is responsible for:

- Document preview.
- Document selection.
- Download requests.

The backend is responsible for:

- Document rendering.
- PDF generation.
- Returning downloadable PDF files.

The backend must expose a reusable document rendering service.

This service is responsible for producing downloadable documents independently of the Export workflow.

The Export workflow must never depend on a specific PDF rendering library implementation.

---

# PDF Requirements

PDF generation must:

- Use the latest saved Optimized CV.
- Use the latest saved Cover Letter only when a Cover Letter exists and that document is requested.
- Match the preview shown to the user.
- Preserve document formatting.
- Produce professional printable documents.
- Render the Optimized CV header from the saved Optimized CV according to `docs/specs/master-cv-personal-information.md` for identity content and `docs/specs/master-cv-profile-photo.md` for the photo sibling.
- Never read Master CV Personal Information, including the Master CV photo, to fill the Optimized CV or Cover Letter document body.
- When the saved Optimized CV snapshot has no photo, omit the photo region completely. Do not reserve empty space.
- Cover Letter PDFs must not render a profile photo.

`professionalTitle` used in Optimized CV filenames remains owned by the Master CV.

PDF rendering is performed exclusively by the backend through the reusable document rendering service.

The rendering service should allow future support for additional output formats without modifying the Export workflow.

---

# File Naming

Generated PDF files follow:

### Optimized CV

```
{candidate-name}_{professional-title}_cv.pdf
```

Example

```
juan-perez_full-stack-developer_cv.pdf
```

The professional title is obtained from the user's saved Master CV.

### Cover Letter

```
{candidate-name}_cover-letter.pdf
```

Example

```
juan-perez_cover-letter.pdf
```

Users cannot rename files during Export.

---

# Non Functional Requirements

Export should feel responsive.

PDF generation begins only after explicit user action.

PDF files must never be permanently stored.

The implementation should reuse the existing frontend and backend architecture whenever possible.

Document rendering should be reusable by future application features.

---

## Out of Scope

This Epic does NOT include:

- AI generation.
- AI regeneration.
- Editing application documents.
- Saving application documents.
- ZIP export.
- Additional document formats.
- Email sending.
- Sharing documents.
- Custom templates.
- User-defined filenames.
- Reading the live Master CV photo for Optimized CV preview or PDF.
- Cover Letter profile photo.
- A `wantsCoverLetter`, `skipCoverLetter`, or equivalent database field.
- A new application completion status.

---

## Acceptance Criteria

Users can preview the latest saved Optimized CV after it has been saved.

When no Cover Letter exists, Cover Letter is not shown as a selectable or previewable document.

When a Cover Letter has been saved, users can switch between document previews.

Users can choose which existing documents to download.

Users can download Optimized CV only, or both documents as independent PDF files when a Cover Letter has been saved.

Users can export after saving an Optimized CV without generating a Cover Letter.

Users can return later and generate or save a Cover Letter after a previous CV-only export.

Generated PDFs exactly match the latest saved application documents.

Optimized CV preview and PDF render the photo sibling from the saved Optimized CV snapshot according to `docs/specs/master-cv-profile-photo.md`. They must not read the live Master CV photo.

Cover Letter preview and PDF must not render a profile photo.

Export never modifies application documents.

The backend generates PDF files.

PDF files are not permanently stored.

The document rendering service is reusable.

The implementation follows the responsibilities defined in:

- docs/product/09-export.md

---

# Implementation Phases

The implementation must be completed incrementally.

## Phase 1

Preview Documents

## Phase 2

Document Selection

## Phase 3

Export PDFs

Each phase must be independently testable.

No future phase should be implemented before its corresponding implementation task is approved.