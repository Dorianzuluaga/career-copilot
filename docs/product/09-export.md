# Export

## Purpose

The Export section is the final step of the Application Workspace.

Its purpose is to allow users to export the final application documents after they have completed and approved their Optimized CV and Cover Letter.

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
Saved Cover Letter
        │
        ▼
Export
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

Export becomes available only after:

- A valid saved Optimized CV exists.
- A valid saved Cover Letter exists.

Export cannot be accessed before both application documents have been saved.

---

# Source of Truth

The latest saved Optimized CV and the latest saved Cover Letter are the only source of truth for Export.

Export never uses:

- Generated drafts
- Unsaved edits
- AI responses
- Master CV

---

# Preview

The Export section displays one document preview at a time.

Users switch between document previews using the document selector.

The preview represents exactly how the generated PDF will appear.

The preview is completely read-only.

Export never provides inline editing.

If users want to modify a document, they must return to its corresponding workspace section.

---

# Document Selection

Users may choose to download:

- Optimized CV only
- Cover Letter only
- Both documents

Only the selected documents are exported.

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
- Generate new AI content.
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

- Preview the latest saved application documents.
- Choose which documents to download.
- Download one or both documents as independent PDF files.
- Trust that exported PDFs exactly match the latest saved versions.
- Complete the application workflow without editing documents inside Export.

# Product Principle

Export is the final presentation layer of the Application Workspace.

Its responsibility is limited to rendering and downloading previously approved application documents.

Export never changes the application state.