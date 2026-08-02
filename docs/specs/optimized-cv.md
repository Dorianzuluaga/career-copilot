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

Master CV
Job Analysis
Profile Match

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

## Phase 3 — Manual Editing

Allow users to manually edit the generated Optimized CV.

Users may:

Edit existing text.
Remove generated content.
Add new information.

Manual modifications become the user's responsibility.

The AI must not automatically regenerate content while users are editing.

Manual edits should remain unchanged until users explicitly save a new version.

## Phase 4 — Save Optimized Version

Allow users to save the current Optimized CV.

Users should explicitly decide when the current version becomes the saved version for the application.

The saved document becomes associated with the current Application Workspace.

Saving must not modify the Master CV.

This Epic does not define unsaved changes behavior.

No PDF generation should be introduced.

## Phase 5 — Continue Workflow

After a valid Optimized CV exists, allow users to continue toward the Cover Letter section.

This phase only updates the workflow progression.

No Cover Letter generation is implemented.

## UI Requirements

The Optimized CV section must:

- Preserve the current Application context.
- Present one editable document.
- Organize information into logical document sections.
- Support a review-first workflow before editing.
- Clearly distinguish generated content from manual edits whenever applicable.
- Follow the responsibilities defined in:
  - docs/product/07-optimized-cv.md

## AI Requirements

The AI generates the initial draft of the Optimized CV.

The AI may:

Rewrite existing content.
Improve wording.
Reorganize information.
Improve ATS compatibility.
Emphasize relevant experience.

The AI must never:

Invent professional experience.
Change employment dates.
Create fictitious projects.
Fabricate certifications.
Modify personal information.
Alter factual meaning.

After generation, users become responsible for any manual modifications they perform.

## Non Functional Requirements

Generation should feel responsive.

The generated document should remain available while navigating inside the Application Workspace.

The implementation should reuse the existing frontend architecture whenever possible.

The Master CV must never be modified during this workflow.

## Out of Scope

This Epic does NOT include:

PDF generation.
Cover Letter generation.
Export functionality.
AI regeneration during manual editing.
Multiple Optimized CV versions.
Version history.
Automatic saving.
Master CV modifications.
Backend changes unrelated to Optimized CV generation.

## Acceptance Criteria

Users can generate an Optimized CV.

Users can review the generated document.

Users can manually edit the generated document.

Users can save the Optimized CV.

The saved document remains associated with the current Application.

The Master CV remains unchanged.

The workflow can continue toward Cover Letter.

Users can continue working inside the Application Workspace without losing the current application context.

The implementation follows the responsibilities defined in:

docs/product/07-optimized-cv.md

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