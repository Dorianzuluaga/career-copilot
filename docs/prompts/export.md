# Phase 1: Preview Documents

Before writing any code:

1. Read:
   - docs/engineering/AI_ENGINEERING.md
   - docs/engineering/PROJECT_RULES.md
   - docs/engineering/DEVELOPMENT_GUIDE.md
   - docs/product/09-export.md
   - docs/specs/export.md

2. Implement only:

Phase 1 — Preview Documents

3. Respect all documented architecture, responsibilities, UI requirements, and implementation phases.

Display the latest saved application documents in the Export section.

The preview must:

- Show one document at a time.
- Be completely read-only.
- Match the intended PDF layout as closely as possible.
- Render directly from the latest saved application documents.
- Never generate or download PDF files.

Do not implement:

- Document selection.
- PDF generation.
- Download.
- Backend rendering.
- Future phases.

Reuse the existing Application Workspace architecture whenever possible.

If any product or architectural decision is ambiguous, stop and ask for clarification instead of making assumptions.

When finished provide:

- Summary
- Files modified
- Architectural decisions
- Assumptions (if any)
- Validation performed

Wait for review before making additional changes.

# Phase 2: Document Selection

Before writing any code:

1. Read:
   - docs/engineering/AI_ENGINEERING.md
   - docs/engineering/PROJECT_RULES.md
   - docs/engineering/DEVELOPMENT_GUIDE.md
   - docs/product/09-export.md
   - docs/specs/export.md

2. Implement only:

Phase 2 — Document Selection

3. Respect all documented architecture, responsibilities, UI requirements, and implementation phases.

Allow users to choose which documents will be exported.

Supported selections:

- Optimized CV
- Cover Letter
- Both documents

The selection must:

- Only affect the future export process.
- Never modify application documents.
- Never generate PDF files.
- Never start downloads.
- Preserve the current preview behavior implemented in Phase 1.

Reuse the existing Application Workspace architecture whenever possible.

If any product or architectural decision is ambiguous, stop and ask for clarification instead of making assumptions.

When finished provide:

- Summary
- Files modified
- Architectural decisions
- Assumptions (if any)
- Validation performed

Wait for review before making additional changes.

# Phase 3: Export PDFs

Before writing any code:

1. Read:
   - docs/engineering/AI_ENGINEERING.md
   - docs/engineering/PROJECT_RULES.md
   - docs/engineering/DEVELOPMENT_GUIDE.md
   - docs/product/09-export.md
   - docs/specs/export.md

2. Implement only:

Phase 3 — Export PDFs

3. Respect all documented architecture, responsibilities, UI requirements, and implementation phases.

Implement PDF export using the reusable backend document rendering service.

The implementation must:

- Generate PDF files only after users explicitly request a download.
- Use only the latest saved application documents.
- Generate one independent PDF per selected document.
- Never permanently store generated PDF files.
- Never modify application documents.
- Never regenerate AI content.
- Reuse the existing Application Workspace architecture whenever possible.

Do not implement:

- ZIP export.
- Additional document formats.
- Email delivery.
- Future Export features.

If any product or architectural decision is ambiguous, stop and ask for clarification instead of making assumptions.

When finished provide:

- Summary
- Files modified
- Architectural decisions
- Assumptions (if any)
- Validation performed

Wait for review before making additional changes.