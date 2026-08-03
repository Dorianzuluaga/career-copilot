# Optimized CV Specification

## Overview

This Epic implements the Optimized CV described in:

- docs/product/07-optimized-cv.md

The goal of this Epic is to generate an editable, job-specific version of the user's Master CV for a single Application Workspace.

The implementation focuses on adapting existing professional information according to the completed Job Analysis and Profile Match.

This Epic introduces the first AI-generated application document while preserving the Master CV as the single source of truth.

The generated document always remains under the user's control through review and manual editing before future export.

---

# Routing

The Optimized CV is accessed from the Application Workspace.

It is not a standalone page.

Users can access the Optimized CV only after completing the Profile Match step.

No additional routes should be introduced during this Epic.

---

# Business Goal

Provide users with a professional, ATS-friendly version of their Master CV tailored to a specific job opportunity.

The generated document should reduce repetitive work while preserving factual accuracy and allowing users to review and edit the final result before continuing the application workflow.

---

# User Story

As a user,

I want Career Copilot to generate an optimized version of my Master CV for a specific job opportunity,

so that I can submit a more relevant application without manually rewriting my CV every time.

---

# Workflow

```text
Application Workspace
        │
        ▼
Optimized CV
        │
        ▼
Generate Optimized CV
        │
        ▼
Review Generated Version
        │
        ▼
Manual Editing
        │
        ▼
Save Optimized Version
        │
        ▼
Continue to Cover Letter
```

---

# Functional Requirements

## Phase 1 — Generate Optimized CV

Generate the first version of the Optimized CV.

The generation must use:

- Master CV
- Job Analysis
- Profile Match

The generated document must be designed to support manual editing in future phases.

No manual editing is introduced during this phase.

No document persistence is introduced during this phase.

No PDF generation is introduced during this phase.

---

## Phase 2 — Review Optimized CV

Display the generated Optimized CV organized into clearly separated document sections.

The review interface should present the complete document organized into clearly separated sections, allowing users to inspect each section independently before manual editing becomes available.

The review interface should prioritize readability.

No editing capabilities should be implemented during this phase.

No document persistence should be implemented during this phase.

---

## Phase 3 — Manual Editing

Allow users to manually edit the generated Optimized CV.

Only application-specific content may be edited.

Editable content includes:

- Professional Summary
- Professional experience descriptions
- Skills
- User-added application-specific content

Users may:

- Edit existing text.
- Remove generated content.
- Add new information.

The following information remains read-only because it belongs to the Master CV:

- Personal information
- Employment dates
- Company names
- Job titles
- Education identity
- Certification identity

Changes to factual profile information must always be performed in the Master CV.

Manual modifications become the user's responsibility.

The AI must not automatically regenerate content while users are editing.

No document persistence should be implemented during this phase.

---

## Phase 4 — Save Optimized Version

Allow users to save the current Optimized CV.

Users should explicitly decide when the current version becomes the saved version for the application.

The saved document becomes associated with the current Application Workspace.

Saving must not modify the Master CV.

This Epic does not define unsaved changes behavior.

No PDF generation should be introduced.

The saved Optimized CV must be persisted as the single Optimized CV associated with the current Application Workspace.

Only one Optimized CV may exist per Application.

Saving a newer Optimized CV replaces the previously saved version.

No version history is introduced during this Epic.

When reopening the same Application Workspace, the previously saved Optimized CV must be restored.

Unsaved Optimized CV versions exist only during the current workspace session.

---

## Phase 5 — Continue Workflow

After a valid saved Optimized CV exists, allow users to continue toward the Cover Letter section.

This phase only updates the workflow progression.

No Cover Letter generation is implemented.

---

## UI Requirements

The Optimized CV section must:

- Preserve the current Application context.
- Present one editable Optimized CV document.
- Clearly distinguish editable content from protected Master CV information.
- Keep Master CV factual information read-only.
- Organize information into logical document sections.
- Support a review-first workflow before editing.
- Clearly distinguish generated content from manual edits whenever applicable.
- Follow the responsibilities defined in:
  - docs/product/07-optimized-cv.md

---

## AI Requirements

The AI generates the initial draft of the Optimized CV.

The AI may:

- Rewrite existing content.
- Improve wording.
- Reorganize information.
- Improve ATS compatibility.
- Emphasize relevant experience.

The AI must never:

- Invent professional experience.
- Change employment dates.
- Create fictitious projects.
- Fabricate certifications.
- Modify personal information.
- Alter factual meaning.

After generation, users become responsible for any manual modifications they perform.

---

## Non Functional Requirements

Generation should feel responsive.

The generated document should remain available while navigating inside the Application Workspace.

The implementation should reuse the existing frontend architecture whenever possible.

The Master CV must never be modified during this workflow.

Once an Optimized CV has been saved, it must be restored when reopening the corresponding Application Workspace.

---

## Out of Scope

This Epic does NOT include:

- PDF generation.
- Cover Letter generation.
- Export functionality.
- AI regeneration during manual editing.
- Multiple Optimized CV versions.
- Version history.
- Automatic saving.
- Unsaved changes detection.
- Master CV modifications.
- Backend changes unrelated to Optimized CV generation.

---

## Acceptance Criteria

Users can generate an Optimized CV.

Users can review the generated document.

Users can manually edit the application-specific content of the generated Optimized CV.

Protected Master CV information remains read-only.

Manual edits remain available while navigating inside the current Application Workspace session.

Users can save the Optimized CV.

The saved document remains associated with the current Application.

Reopening the same Application Workspace restores the previously saved Optimized CV.

Saving a new Optimized CV replaces the previously saved version.

Only one Optimized CV exists per Application.

The Master CV remains unchanged.

The workflow can continue toward Cover Letter.

Users can continue working inside the Application Workspace without losing the current application context.

The implementation follows the responsibilities defined in:

- docs/product/07-optimized-cv.md

---

# Implementation Phases

The implementation must be completed incrementally.

Phase 1

Generate Optimized CV

Phase 2

Review Optimized CV

Phase 3

Manual Editing

Phase 4

Save Optimized Version

Phase 5

Continue Workflow

Each phase must be independently testable.

No future phase should be implemented before its corresponding implementation task is approved.
