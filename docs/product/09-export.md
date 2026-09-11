# Export

## Purpose

The Export section is the final step of the Application Workspace.

Its purpose is to allow users to export the latest saved application documents after they have completed and approved their Optimized CV. A Cover Letter is included only when one has been saved.

Export never creates new content.

Export only renders the latest saved application documents into downloadable PDF files.

---

# Product Goals

The Export workflow should:

- Provide a final review before download.
- Allow users to decide which documents to export.
- Generate professional PDF documents.
- Preserve the integrity of the saved application documents.
- Keep the user in control of the final export process.

---

# User Problem

Before submitting a job application, users need professional documents that accurately represent the versions they have reviewed and approved.

Users should never wonder whether the exported documents differ from what they previously saved.

---

# User Story

As a user,

I want to preview and export my completed application documents,

so that I can confidently submit them to employers knowing they match the versions I previously approved.

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
            Generate PDF(s)
                │
                ▼
            Download
```

---

# Export Availability

Export becomes available after:

- A valid saved Optimized CV exists.

A saved Cover Letter is not required.

Export cannot be accessed before an Optimized CV has been saved.

Users may later generate and save a Cover Letter after a previous CV-only export. Export then may include both documents.

---

# Source of Truth

The latest saved Optimized CV is always a source of truth for Export.

The latest saved Cover Letter is a source of truth only when a Cover Letter exists.

If no Cover Letter exists, Export is Optimized CV only. The export pipeline must not require or load a Cover Letter for that CV-only output.

An unsaved Cover Letter draft is never a source of truth for Export.

Export never uses:

- Generated drafts
- Unsaved edits
- AI responses
- Master CV

---

# Preview

The Export section displays one document preview at a time.

When no Cover Letter exists, Optimized CV is the only previewable document. Cover Letter is not shown as a selectable or previewable document.

When a Cover Letter has been saved, users switch between document previews using the document selector.

The preview represents exactly how the generated PDF will appear.

The preview is completely read-only.

Export never provides inline editing.

If users want to modify a document, they must return to its corresponding workspace section.

---

# Document Selection

When no Cover Letter exists, Optimized CV is the only selectable and downloadable document.

When a Cover Letter has been saved, users may choose to download:

- Optimized CV only
- Cover Letter only
- Both documents

Only the selected documents are exported.

When a saved Cover Letter is included, existing Presentation Language behavior for that Cover Letter remains unchanged. When no Cover Letter exists, Presentation Language applies to the Optimized CV only, and no Cover Letter presentation or adaptation AI call occurs.

---

# PDF Generation

PDF generation starts only after users explicitly click **Download**.

PDF files are generated from the latest saved application documents.

PDF files are never permanently stored.

Each download generates fresh PDF files.

---

# Download

Each selected document is downloaded as an independent PDF file.

ZIP export is outside the MVP.

The application never starts downloads automatically.

Users explicitly decide when to begin the download.

---

# File Naming

The application automatically generates file names.

Users do not choose file names during Export.

Current naming convention:

Optimized CV

```
{candidate-name}_{professional-title}_cv.pdf
```

Example

```
juan-perez_full-stack-developer_cv.pdf
```

The candidate name is always taken from the user's saved Master CV `fullName`.

The professional title is owned by the user's saved Master CV `professionalTitle`.

If `professionalTitle` is missing or empty, the Optimized CV filename falls back to:

```
{candidate-name}_cv.pdf
```

Export must never fail because of a missing professional title.

Cover Letter

```
{candidate-name}_cover-letter.pdf
```

Example

```
juan-perez_cover-letter.pdf
```

Filenames are normalized with a single slugification rule:

- lowercase
- remove accents
- replace whitespace with `-`
- remove unsupported non-alphanumeric characters

---

# Business Rules

Export must never:

- Modify saved documents.
- Generate new Optimized CV or Cover Letter content.
- Call Cover Letter generation AI.
- Call Cover Letter presentation or adaptation AI when no Cover Letter exists.
- Save new document versions.
- Update the Application.
- Replace existing saved documents.

Export is a completely read-only process.

---

# Future Evolution

Future versions may support:

- ZIP export.
- Additional export formats.
- Custom templates.
- Multiple visual themes.
- Localization.
- User-defined file naming.

These capabilities are outside the MVP.

---

# Success Criteria

Users can:

- Preview the latest saved Optimized CV after it has been saved.
- Preview a Cover Letter only when a Cover Letter has been saved.
- Choose which documents to download from the documents that exist.
- Download Optimized CV only, or both documents as independent PDF files when a Cover Letter has been saved.
- Trust that exported PDFs exactly match the latest saved versions.
- Complete Export without generating a Cover Letter.
- Return later to generate and save a Cover Letter after a previous CV-only export.

# Product Principle

Export is the final presentation layer of the Application Workspace.

Its responsibility is limited to rendering and downloading previously approved application documents.

Export never changes the application state.