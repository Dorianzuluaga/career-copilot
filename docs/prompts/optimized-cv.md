# Phase 1: Generate Optimized CV

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/product/07-optimized-cv.md
7. docs/specs/optimized-cv.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement only **Phase 1 — Generate Optimized CV** from:

- docs/specs/optimized-cv.md

Do not implement any future phase.

---

## Phase 1 Scope

Generate the initial Optimized CV using:

- Master CV
- Job Analysis
- Profile Match

The generated document must:

- Be specific to the current Application Workspace.
- Preserve the Master CV as the single source of truth.
- Use only factual information available in the application context.
- Adapt existing content without inventing professional experience.
- Be structured into logical document sections.

No manual editing should be implemented.

No document persistence should be implemented.

No PDF generation should be implemented.

No Cover Letter functionality should be implemented.

---

## AI Requirements

The AI may:

- Rewrite existing information.
- Improve wording.
- Reorganize existing content.
- Improve ATS compatibility.
- Emphasize relevant experience.

The AI must never:

- Invent professional experience.
- Modify employment dates.
- Change company names.
- Create fictitious projects.
- Fabricate certifications.
- Alter factual meaning.

---

## Architectural Constraints

Do not modify:

- Existing Application Workspace navigation.
- Existing Job Analysis functionality.
- Existing Profile Match functionality.
- Master CV behavior.
- Backend endpoints unrelated to Optimized CV generation.
- Existing API contracts unrelated to this phase.

Reuse the existing frontend and backend architecture whenever possible.

---

## Decision Policy

Do not make product decisions.

If any of the following is ambiguous, stop and ask for clarification before implementing:

- Document structure.
- AI output structure.
- Optimized CV sections.
- Data model.
- API contract.
- User workflow.
- Persistence behavior.
- Anything belonging to a future phase.

Never assume functionality that is not explicitly documented.

---

## Validation

Before finishing, validate:

- TypeScript
- ESLint
- Tests
- Production build
- Formatting
- git diff --check

---

When finished provide:

1. Summary
2. Files modified
3. Architectural decisions
4. Assumptions made (if any)
5. Validation performed

Do not implement Phase 2 or any future phase.

Wait for review before making additional changes.

# Phase 2: Review Optimized CV

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/product/07-optimized-cv.md
7. docs/specs/optimized-cv.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement only **Phase 2 — Review Optimized CV** from:

- docs/specs/optimized-cv.md

Do not implement any future phase.

---

## Phase 2 Scope

Display the generated Optimized CV inside the Application Workspace.

The review interface must:

- Display the generated Optimized CV.
- Preserve the logical document structure of the Master CV.
- Display each document section independently.
- Prioritize readability over editing.
- Allow users to review the complete generated document before making any modifications.

The generated document should remain read-only during this phase.

No editing capabilities should be implemented.

No document persistence should be implemented.

No PDF generation should be implemented.

No Cover Letter functionality should be implemented.

No Export functionality should be implemented.

---

## UI Requirements

The review interface should:

- Present one complete Optimized CV.
- Display clearly separated document sections.
- Preserve the current Application Workspace context.
- Reuse the existing workspace architecture whenever possible.

The interface should behave as a document review screen, not as an editor.

The review interface must not introduce any editing controls.

Do not render:

- textareas
- input fields
- editable content
- save buttons
- cancel buttons
- edit buttons

The generated Optimized CV should be presented exactly as a document for reading and review.

Editing belongs exclusively to Phase 3.

---

## Architectural Constraints

Do not modify:

- Existing Application Workspace navigation.
- Existing Job Analysis functionality.
- Existing Profile Match functionality.
- Existing Optimized CV generation flow.
- Existing API contracts.
- Existing backend business logic.
- Master CV behavior.

Reuse the existing frontend architecture whenever possible.

---

## Decision Policy

Do not make product decisions.

If any of the following is ambiguous, stop and ask for clarification before implementing:

- Document layout.
- Section presentation.
- Review workflow.
- Navigation behavior.
- User interactions.
- Anything belonging to future phases.

Never assume functionality that is not explicitly documented.

---

Phase Boundary

The implementation must not introduce UI controls, API behavior, persistence, workflow changes, or business logic belonging to future phases, even if they appear technically convenient.

If implementing the requested phase requires functionality from a future phase, stop and ask for clarification instead of implementing it.


## Validation

Before finishing, validate:

- TypeScript
- ESLint
- Tests
- Production build
- Formatting
- git diff --check

---

When finished provide:

1. Summary
2. Files modified
3. Architectural decisions
4. Assumptions made (if any)
5. Validation performed

Do not implement Phase 3 or any future phase.


# Phase 3: Manual Editing

Before writing any code:

1. Read:
   - docs/engineering/AI_ENGINEERING.md
   - docs/engineering/PROJECT_RULES.md
   - docs/engineering/DEVELOPMENT_GUIDE.md
   - docs/product/07-optimized-cv.md
   - docs/specs/optimized-cv.md

2. Implement only:

Phase 3 — Manual Editing

3. Respect all documented architecture, responsibilities, AI boundaries, UI requirements, and implementation phases.

Do not implement future phases.

If any product or architectural decision is ambiguous, stop and ask for clarification instead of making assumptions.

When finished provide:

- Summary
- Files modified
- Architectural decisions
- Assumptions (if any)
- Validation performed

Wait for review before making additional changes.

# Phase 4: Save Optimized Version

Before writing any code:

1. Read:
   - docs/engineering/AI_ENGINEERING.md
   - docs/engineering/PROJECT_RULES.md
   - docs/engineering/DEVELOPMENT_GUIDE.md
   - docs/product/07-optimized-cv.md
   - docs/specs/optimized-cv.md

2. Implement only:

Phase 4 — Save Optimized Version

3. Respect all documented architecture, responsibilities, AI boundaries, UI requirements, and implementation phases.

Do not implement future phases.

If any product or architectural decision is ambiguous, stop and ask for clarification instead of making assumptions.

When finished provide:

- Summary
- Files modified
- Architectural decisions
- Assumptions (if any)
- Validation performed

Wait for review before making additional changes.

# Phase 5: Continue Workflow

Before writing any code:

1. Read:
   - docs/engineering/AI_ENGINEERING.md
   - docs/engineering/PROJECT_RULES.md
   - docs/engineering/DEVELOPMENT_GUIDE.md
   - docs/product/07-optimized-cv.md
   - docs/specs/optimized-cv.md

2. Implement only:

Phase 5 — Continue Workflow

3. Respect all documented architecture, responsibilities, UI requirements, AI boundaries, and implementation phases.

Do not implement future phases.

If any product or architectural decision is ambiguous, stop and ask for clarification instead of making assumptions.

When finished provide:

- Summary
- Files modified
- Architectural decisions
- Assumptions (if any)
- Validation performed

Wait for review before making additional changes.
