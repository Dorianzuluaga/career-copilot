# Cover Letter Specification

## Overview

This Epic implements the Cover Letter described in:

- docs/product/08-cover-letter.md

The goal of this Epic is to generate an editable, application-specific Cover Letter for a single Application Workspace when the user chooses to include one.

The Cover Letter is an optional output, not a required stage for Export.

The implementation uses the completed Job Analysis, Profile Match, and the saved Optimized CV to generate a professional Cover Letter while preserving factual accuracy.

The generated document always remains under the user's control through review and manual editing before it can be included in Export.

---

# Routing

The Cover Letter is accessed from the Application Workspace.

It is not a standalone page.

Users can access the Cover Letter only after a valid Optimized CV has been saved.

Cover Letter generation is not required to leave Optimized CV or to reach Export.

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
Optimized CV Saved
        │
        ├──► Export without Cover Letter
        │
        └──► Cover Letter
                │
                ▼
            Generate Cover Letter
            (explicit user action only)
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

# Document States

The Cover Letter has three product states:

- **Does not exist.** No Cover Letter record is stored. Export is available as Optimized CV only. No Cover Letter generation or Cover Letter presentation/adaptation AI call occurs.
- **Exists and is saved.** One Cover Letter record is associated with the application. Existing generate, review, edit, save, preview, and download behavior remains.
- **Draft exists but is unsaved.** The generated or edited version exists only during the current workspace session. Generating a new Cover Letter does not automatically replace a previously saved Cover Letter. Only Save persists a version. Unsaved drafts are not included in Export.

Absence of the Cover Letter record is sufficient. Do not add a `wantsCoverLetter`, `skipCoverLetter`, or equivalent database field.

---

# Functional Requirements

## Phase 1 — Generate Cover Letter

Generate the first version of the Cover Letter.

Generation is explicitly user-triggered. It must never run automatically.

The AI generation call occurs only when the user chooses Generate, Try again, or Generate again.

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

An unsaved draft does not create a Cover Letter record and is not included in Export.

---

## Phase 5 — Continue Workflow

Export is available after a valid saved Optimized CV exists, including when no Cover Letter exists.

If a Cover Letter has been saved, users may continue toward Export with Optimized CV + Cover Letter.

This phase only updates the workflow progression. It must not make Cover Letter generation mandatory.

No Export functionality is implemented.

---

# UI Requirements

The Cover Letter section must:

- Preserve the current Application context.
- Present one editable Cover Letter document when a generated or saved Cover Letter exists.
- Present an explicit Generate action when no Cover Letter exists, without auto-generating.
- Organize the document according to the defined Cover Letter structure.
- Support a review-first workflow before editing.
- Behave as a document editor rather than a form.
- Clearly distinguish generated content from manual edits whenever applicable.
- Keep the Cover Letter header without a profile photo. Photo behavior is specified in `docs/specs/master-cv-profile-photo.md` and applies only to the Master CV and Optimized CV.
- Follow the responsibilities defined in:
  - docs/product/08-cover-letter.md

---

# AI Requirements

The AI generates the initial Cover Letter only after an explicit Generate, Try again, or Generate again action.

The AI must never generate a Cover Letter automatically.

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

- Automatic Cover Letter generation.
- A `wantsCoverLetter`, `skipCoverLetter`, or equivalent database field.
- A new application completion status.
- Export functionality.
- AI regeneration during manual editing.
- Multiple Cover Letter versions.
- Version history.
- Automatic saving.
- Unsaved changes detection.
- Optimized CV modifications.
- Profile photo on the Cover Letter.
- Backend changes unrelated to Cover Letter generation.

---

# Acceptance Criteria

Users can generate a Cover Letter through an explicit Generate, Try again, or Generate again action.

Cover Letter generation never runs automatically.

Users can review the generated document.

Users can manually edit the generated Cover Letter.

Manual edits remain available while navigating inside the current Application Workspace session.

Users can save the Cover Letter.

The saved Cover Letter remains associated with the current Application.

Reopening the same Application Workspace restores the previously saved Cover Letter.

If no Cover Letter has been saved, reopening the Application Workspace does not generate one.

Saving a new Cover Letter replaces the previously saved version.

Only one Cover Letter exists per Application when the user chooses to save one.

Absence of a Cover Letter record means no Cover Letter is included. No `wantsCoverLetter`, `skipCoverLetter`, or equivalent field is introduced.

An unsaved Cover Letter draft is session-only and is not included in Export.

The Optimized CV remains unchanged.

Users can continue toward Export with or without a saved Cover Letter.

Users can return later and generate or save a Cover Letter after a previous CV-only export.

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
