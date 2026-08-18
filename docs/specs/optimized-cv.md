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

The Optimized CV should also be able to include relevant Personal Projects from the user's Master CV when those projects provide meaningful evidence for the target job opportunity.

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

The Master CV may contain:

Personal Information
Professional Summary
Experience
Education
Skills
Languages
Certifications
Personal Projects

The AI must evaluate Personal Projects against the available application context and may include projects that are relevant to the target job opportunity.

Personal Projects are optional.

If no Personal Projects are relevant to the target job opportunity, the generated Optimized CV should not include a Personal Projects section.

The generated document must be designed to support manual editing in future phases.

No manual editing is introduced during this phase.

No document persistence is introduced during this phase.

No PDF generation is introduced during this phase.

Personal Project Selection

Personal Projects included in the Optimized CV must originate exclusively from the user's Master CV.

The AI may:

Select relevant Personal Projects.
Omit irrelevant Personal Projects.
Prioritize the most relevant projects when multiple projects exist.
Adapt project descriptions to emphasize relevance while preserving factual meaning.

The AI must never:

Invent a Personal Project.
Create a project that does not exist in the Master CV.
Invent technologies.
Invent project URLs.
Invent achievements or outcomes.
Alter factual project information.

If the Master CV contains no Personal Projects, the Optimized CV must continue to work normally.

---

## Phase 2 — Review Optimized CV

Display the generated Optimized CV organized into clearly separated document sections.

The review interface should present the complete document organized into clearly separated sections, allowing users to inspect each section independently before manual editing becomes available.

The review interface should prioritize readability.

The Optimized CV may contain the following sections when applicable:

Personal Information
Professional Summary
Experience
Education
Skills
Languages
Certifications
Personal Projects

Personal Projects should only be displayed when they were selected for the generated Optimized CV.

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
- Personal Project descriptions
- User-added application-specific content

Users may:

- Edit existing text.
- Remove generated content.
- Add new information where supported.

### Personal Projects

Users may edit the description of a selected Personal Project.

Users may also add Personal Projects from the Master CV to the Optimized CV.

The user must be able to select any Personal Project currently stored in the Master CV and add it to the current Optimized CV, even if the AI did not select that project during generation.

The AI's initial project selection is only a recommendation. The user has final control over which Personal Projects are included in the Optimized CV.

When a Personal Project is manually added:

- Project name comes from the Master CV.
- Technologies come from the Master CV.
- Project URL comes from the Master CV.
- Project description comes from the Master CV initially.
- The description may then be edited as application-specific content.

A Personal Project already included in the Optimized CV must not be added twice.

Users may remove a selected Personal Project from the Optimized CV.

Removing a project from the Optimized CV must not remove it from the Master CV.

Adding a project to the Optimized CV must not modify the Master CV.

The AI must not automatically regenerate Personal Projects while users are editing.

The following Personal Project information remains read-only because it originates from the Master CV:

- Project name
- Technologies
- Project URL

Changes to these factual project identity fields must always be performed in the Master CV.

### Protected Master CV Information

The following information remains read-only because it belongs to the Master CV:

- Personal information
- Employment dates
- Company names
- Job titles
- Education identity
- Certification identity
- Personal Project names
- Personal Project technologies
- Personal Project URLs

Changes to factual profile information must always be performed in the Master CV.

Manual modifications become the user's responsibility.

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

Personal Projects saved inside the Optimized CV are application-specific selections and do not modify the Personal Projects stored in the Master CV.

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
- Display Personal Projects only when selected for the application.
- Allow users to edit Personal Project descriptions.
- Keep Personal Project names, technologies, and URLs read-only.
- Allow a user to remove a selected Personal Project from the Optimized CV without modifying the Master CV.
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
- Evaluate Personal Projects against the target job opportunity.
- Select relevant Personal Projects.
- Omit irrelevant Personal Projects.
- Adapt selected Personal Project descriptions while preserving factual meaning.

The AI must never:

- Invent professional experience.
- Invent Personal Projects.
- Change employment dates.
- Create fictitious projects.
- Fabricate certifications.
- Modify personal information.
- Invent project technologies.
- Invent project URLs.
- Invent project achievements or outcomes.
- Alter factual meaning.

After generation, users become responsible for any manual modifications they perform.

---

## Personal Projects Rules

Personal Projects are optional information sourced exclusively from the Master CV.

The Optimized CV does not need to contain every Personal Project from the Master CV.

The AI should select projects based on their relevance to the target job opportunity.

For example:

Master CV
    │
    ├── Career Copilot
    ├── Humidity Project
    └── Unrelated Project
            │
            ▼
       Job Analysis
            +
       Profile Match
            │
            ▼
      Optimized CV
            │
            ├── Career Copilot
            └── Humidity Project

The selection is application-specific.

The Master CV remains unchanged.

If no project is sufficiently relevant, the Personal Projects section should be omitted.

Personal Projects must never be used as a mechanism to fabricate professional experience.

---

## Non Functional Requirements

Generation should feel responsive.

The generated document should remain available while navigating inside the Application Workspace.

The implementation should reuse the existing frontend architecture whenever possible.

The Master CV must never be modified during this workflow.

Once an Optimized CV has been saved, it must be restored when reopening the corresponding Application Workspace.

Personal Projects selected for an Optimized CV must remain associated with that application only.

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
- Personal Project creation or editing inside the Optimized CV.
- Modification of Personal Project identity information from the Optimized CV.
- AI-generated Personal Projects.
- External project discovery.
- LinkedIn project import.
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

### Personal Projects

Users can have zero or more Personal Projects in their Master CV.

The Optimized CV can include relevant Personal Projects from the Master CV.

The AI evaluates Personal Projects against the target job opportunity before selecting them.

The AI's project selection is a recommendation and does not restrict the user's final selection.

Users can add any Personal Project from the Master CV to the Optimized CV.

Users can add a Personal Project that was not selected by the AI.

A Personal Project cannot be added more than once to the same Optimized CV.

Irrelevant Personal Projects may be omitted.

If no Personal Projects are relevant and the user does not manually add any project, the Optimized CV does not contain a Personal Projects section.

The AI never creates Personal Projects that do not exist in the Master CV.

The AI never invents project technologies, URLs, achievements, or outcomes.

Selected Personal Projects contain factual information originating from the Master CV.

When a user manually adds a Personal Project, its name, technologies, URL, and initial description are taken from the Master CV.

Users can edit Personal Project descriptions in the Optimized CV.

Users can remove a selected Personal Project from the Optimized CV.

Users can remove both AI-selected and manually added Personal Projects.

Removing a project from the Optimized CV does not remove it from the Master CV.

Adding a project to the Optimized CV does not modify the Master CV.

Project names remain read-only.

Project technologies remain read-only.

Project URLs remain read-only.

The user has final control over which Personal Projects are included in the Optimized CV.

The implementation follows the responsibilities defined in:

docs/product/07-optimized-cv.md

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
