# Cover Letter Specification

## Overview

This Epic implements the Cover Letter described in:

- docs/product/08-cover-letter.md

The goal of this Epic is to generate an editable, application-specific Cover Letter for a single Application Workspace.

The implementation uses the completed Job Analysis, Profile Match, and the saved Optimized CV to generate a professional Cover Letter while preserving factual accuracy.

The generated document always remains under the user's control through review and manual editing before export.

---

# Routing

The Cover Letter is accessed from the Application Workspace.

It is not a standalone page.

Users can access the Cover Letter only after a valid Optimized CV has been saved.

No additional routes should be introduced during this Epic.

---

# Business Goal

Provide users with a professional Cover Letter tailored to a specific job opportunity while minimizing repetitive writing and preserving factual accuracy.

The Cover Letter should complement the Optimized CV rather than duplicate its content.

---

# User Story

As a user,

I want Career Copilot to generate a personalized Cover Letter for my application,

so that I can present my motivation and professional value without rewriting a new letter for every application.

---

# Workflow

```text
Application Workspace
        │
        ▼
Cover Letter
        │
        ▼
Generate Cover Letter
        │
        ▼
Review Generated Version
        │
        ▼
Manual Editing
        │
        ▼
Save Cover Letter
        │
        ▼
Continue to Export
```

---

# Functional Requirements

## Phase 1 — Generate Cover Letter

Generate the first version of the Cover Letter.

The generation must use:

- Master CV
- Job Analysis
- Profile Match
- Saved Optimized CV

The saved Optimized CV is the primary document reference.

The remaining inputs provide contextual information for the generated Cover Letter.

The generated document must support manual editing in future phases.

Generating a new Cover Letter does not automatically replace the saved Cover Letter.

Only an explicit Save operation persists the new version.

No manual editing is introduced during this phase.

No document persistence is introduced during this phase.

No PDF generation is introduced during this phase.

---

## Phase 2 — Review Cover Letter

Display the generated Cover Letter as a single structured document.

The review interface should preserve the document layout introduced during generation.

The review interface should prioritize readability.

No editing capabilities should be implemented during this phase.

No document persistence should be implemented during this phase.

---

## Phase 3 — Manual Editing

Allow users to manually edit the generated Cover Letter.

Users may:

- Edit existing text.
- Remove generated content.
- Add application-specific content.

Manual modifications become the user's responsibility.

The AI must not automatically regenerate content while users are editing.

No document persistence should be implemented during this phase.

---

## Phase 4 — Save Cover Letter

Allow users to explicitly save the current Cover Letter.

The saved Cover Letter becomes associated with the current Application Workspace.

Saving must not modify the Optimized CV.

Only one Cover Letter may exist per Application.

Saving a newer Cover Letter replaces the previous saved version.

No version history is introduced.

When reopening the same Application Workspace, the previously saved Cover Letter must be restored.

Unsaved Cover Letter versions exist only during the current workspace session.

---

## Phase 5 — Continue Workflow

After a valid saved Cover Letter exists, allow users to continue toward the Export section.

This phase only updates the workflow progression.

No Export functionality is implemented.

---

# UI Requirements

The Cover Letter section must:

- Preserve the current Application context.
- Present one editable Cover Letter document.
- Organize the document according to the defined Cover Letter structure.
- Support a review-first workflow before editing.
- Behave as a document editor rather than a form.
- Clearly distinguish generated content from manual edits whenever applicable.
- Follow the responsibilities defined in:
  - docs/product/08-cover-letter.md

---

# AI Requirements

The AI generates the initial Cover Letter.

The AI may:

- Improve wording.
- Adapt tone.
- Organize ideas.
- Generate professional transitions.
- Connect the candidate's experience with the job opportunity.

The AI must never:

- Invent professional experience.
- Invent company information.
- Invent personal motivations.
- Infer company values that are not explicitly present in the Job Analysis.
- Claim knowledge about the company that is not supported by the Job Analysis.
- Fabricate achievements.
- Modify factual profile information.
- Complement the Optimized CV instead of repeating it.
- Promise future performance or outcomes.

After generation, users become responsible for any manual modifications.

---

# Non Functional Requirements

Generation should feel responsive.

The generated Cover Letter should remain available while navigating inside the Application Workspace.

The implementation should reuse the existing frontend architecture whenever possible.

The Cover Letter should normally remain between 200 and 400 words.

---

# Out of Scope

This Epic does NOT include:

- PDF generation.
- Export functionality.
- AI regeneration during manual editing.
- Multiple Cover Letter versions.
- Version history.
- Automatic saving.
- Unsaved changes detection.
- Optimized CV modifications.
- Backend changes unrelated to Cover Letter generation.

---

# Acceptance Criteria

Users can generate a Cover Letter.

Users can review the generated document.

Users can manually edit the generated Cover Letter.

Manual edits remain available while navigating inside the current Application Workspace session.

Users can save the Cover Letter.

The saved Cover Letter remains associated with the current Application.

Reopening the same Application Workspace restores the previously saved Cover Letter.

Saving a new Cover Letter replaces the previously saved version.

Only one Cover Letter exists per Application.

The Optimized CV remains unchanged.

The workflow can continue toward Export.

Users can continue working inside the Application Workspace without losing the current application context.

The implementation follows the responsibilities defined in:

- docs/product/08-cover-letter.md

---

# Implementation Phases

The implementation must be completed incrementally.

Phase 1

Generate Cover Letter

Phase 2

Review Cover Letter

Phase 3

Manual Editing

Phase 4

Save Cover Letter

Phase 5

Continue Workflow

Each phase must be independently testable.

No future phase should be implemented before its corresponding implementation task is approved.
