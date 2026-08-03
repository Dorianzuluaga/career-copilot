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
