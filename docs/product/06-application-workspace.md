# Career Copilot — Application Workspace

## Purpose

The Application Workspace is the central environment where users manage a single job application throughout its lifecycle.

Each application has its own dedicated workspace that brings together every artifact generated during the application process, allowing users to move through the Fast Apply workflow in a structured and guided manner.

Unlike the global User Flow, which describes navigation across the entire platform, the Application Workspace focuses exclusively on the experience inside an individual application after it has been created.

This document defines the structure, responsibilities, and navigation principles of the Application Workspace implemented in the MVP.

> **MVP Scope**

> The current MVP implements only the **Fast Apply** workflow.

> **Guided Apply** and other advanced application experiences are intentionally excluded from the MVP and are planned for future releases.

## Design Philosophy

The Application Workspace is designed around a simple principle:

**One Application = One Workspace**

Instead of exposing isolated AI tools, Career Copilot organizes every task related to a job application inside a dedicated workspace.

Each section has a single responsibility, and every completed step naturally guides the user toward the next stage of the application process.

This approach minimizes cognitive load, keeps users focused on one opportunity at a time, and provides a consistent workflow throughout the application lifecycle.

# Workspace Goals

The Application Workspace is designed to provide a focused environment where users can manage one job opportunity from initial analysis to final submission.

Its primary goals are:

- Keep all information related to a single application in one place.
- Guide users through the Fast Apply workflow without requiring them to decide what to do next.
- Present AI-generated information in a structured and understandable way.
- Reduce context switching by avoiding navigation across multiple unrelated pages.
- Preserve the relationship between the original job description, the user's profile, and every generated document.
- Make it easy to return to an application at any time and continue from the last completed step.

## Core Principles

The Application Workspace is built upon the following principles:

- One Application = One Workspace.
- One Section = One Responsibility.
- Progressive Guidance over Feature Discovery.
- Context is never shared between applications.

## Human Approval

AI-generated documents are never considered final by default.

Users always have the opportunity to review, edit, and approve generated content before it becomes part of the final application package.

# Workspace Structure

Each Application Workspace is organized into independent sections.

Every section has a single responsibility and represents one stage of the Fast Apply workflow.

The completion of one section naturally enables the next one, creating a guided user experience while keeping the entire application organized in a single place.

Current MVP sections:

1. Overview
2. Job Analysis
3. Profile Match
4. Optimized CV
5. Cover Letter
6. Export

These sections represent logical responsibilities rather than independent pages.

The final user interface may present them as tabs, navigation items, panels, or other layouts while preserving the same workflow.

# Workspace Progression

The Application Workspace follows a progressive workflow where each completed section unlocks the next logical step of the application process.

Rather than presenting every available feature at once, the workspace guides users through a structured sequence that reduces cognitive load and keeps the focus on a single objective at each stage.

This progression represents the expected product behavior rather than a technical implementation.

Current MVP progression:

```text
Application Created
        │
        ▼
Job Analysis Completed
        │
        ▼
Profile Match Completed
        │
        ▼
Optimized CV Generated
        │
        ▼
Cover Letter Generated
        │
        ▼
Ready for Export
        │
        ▼
Application Completed
```

Completion of one stage should naturally expose the next recommended action without requiring users to determine the workflow themselves.

At any point, users may return to previous sections to review information or regenerate documents.

The workspace always preserves the complete context of the application.

## Navigation Principle

The Application Workspace is designed to keep users continuously oriented throughout the application process.

At every stage, users should immediately understand:

- Where they are within the current application.
- Which steps have already been completed.
- Which step is currently active.
- What the recommended next step is.

The interface should guide users naturally through the Fast Apply workflow while allowing them to revisit any previously completed section without losing context.

Navigation should reduce cognitive load by presenting one primary objective at a time and preserving the complete history of the application inside its dedicated workspace.

## Context Preservation

Every action performed inside an Application Workspace belongs exclusively to that application.

The original job description, AI analysis, profile comparison, generated documents, and future updates remain associated with the same workspace.

Users should never lose the context of the opportunity they are working on, even when leaving and returning to the application later.

Switching between different applications should never mix data, AI outputs, or generated documents.

Each workspace remains an independent context throughout its lifecycle.

# Overview

## Purpose

The Overview section serves as the entry point to an Application Workspace.

It provides a concise summary of the current application, allowing users to quickly understand its status, recent activity, and overall progress before continuing with the next step of the workflow.

---

## Responsibilities

The Overview section is responsible for:

- Presenting the current state of the application.
- Summarizing key application information.
- Displaying overall workflow progress.
- Helping users resume work from where they left off.
- Providing quick access to every workspace section.

This section does not perform AI analysis or generate content.

---

## Information Displayed

The Overview displays high-level information about the application, including:

- Job title
- Company name
- Application status
- Creation date
- Last updated date
- Current workflow progress
- Completed sections
- Next recommended step

---

## User Actions

Users can:

- Open any available workspace section.
- Continue the next recommended step.
- Review completed sections.
- Return to the Dashboard.

---

## Inputs

The Overview consumes information from:

- Application metadata.
- Workspace progression state.
- Completion status of each workspace section.

---

## Outputs

The Overview does not generate new information.

Its purpose is to organize and present the current state of the Application Workspace.

---

## Completion Criteria

The Overview itself is never considered "completed".

It remains available throughout the entire lifecycle of the application and always reflects the latest workspace state.

---

## Dependencies

### Requires

- Application created.

### Used by

All workspace sections.

The Overview acts as the navigation hub of the Application Workspace.

---

## Navigation

Users may enter the Overview:

- After creating a new application.
- From the Dashboard.
- When reopening an existing application.

From the Overview users can navigate to:

- Job Analysis
- Profile Match
- Optimized CV
- Cover Letter
- Export

Navigation should always prioritize the next recommended workflow step while allowing access to previously completed sections.

---

## AI Responsibilities

This section does not invoke AI.

It only presents or prepares information generated by previous workspace sections.

---

## Future Evolution

Future versions may include:

- Upcoming tasks.
- Activity timeline.
- Recent AI generations.
- Application reminders.
- Interview schedule.
- Follow-up tracking.
- Notes.
- Company insights.

---

# Job Analysis

## Purpose

The Job Analysis section transforms an unstructured job description into structured information that can be understood by both the user and the rest of the Application Workspace.

It represents the first analytical step of the Fast Apply workflow and establishes the foundation for all subsequent AI-assisted features.

---

## Responsibilities

The Job Analysis section is responsible for:

- Analyzing the original job description.
- Extracting structured job information.
- Identifying required skills and technologies.
- Identifying responsibilities and qualifications.
- Presenting the analysis in a clear and organized format.
- Providing structured data for downstream workspace sections.

This section does not compare the job description with the user's profile.

---

## Information Displayed

The Job Analysis displays information extracted from the original job description, including:

- Job title
- Company (when available)
- Seniority level
- Employment type
- Required skills
- Technologies
- Responsibilities
- Qualifications
- Soft skills
- Additional observations (if applicable)

---

## User Actions

Users can:

Update the job description.
Regenerate the analysis.
Continue to Profile Match.

---

## Inputs

The Job Analysis requires:

- Job Description

---

## Outputs

The Job Analysis produces structured information that becomes part of the Application Workspace.

Its outputs are consumed by:

- Profile Match
- Optimized CV
- Cover Letter

---

## Completion Criteria

This section is considered completed when a valid structured analysis has been successfully generated.

If the job description changes, the analysis becomes outdated and should be regenerated.

---

## Dependencies

### Requires

- Application created
- Job Description available

### Used by

- Profile Match
- Optimized CV
- Cover Letter

---

## Navigation

Users arrive here immediately after creating an application or selecting an existing one.

Once completed, the recommended next step is:

**Profile Match**

Users may revisit this section at any time.

---

## AI Responsibilities

The AI is responsible for:

- Extracting structured information.
- Identifying relevant technologies.
- Identifying required skills.
- Identifying responsibilities.
- Organizing the job description into meaningful categories.

The AI must not:

- Evaluate the user's profile.
- Estimate compatibility.
- Suggest CV improvements.
- Generate application documents.

---

## Future Evolution

Future versions may include:

- Salary extraction.
- Benefits extraction.
- Company insights.
- Job market trends.
- Automatic duplicate detection.
- Multi-language normalization.

---

# Profile Match

## Purpose

The Profile Match section compares the user's Master CV against the structured job requirements generated during the Job Analysis.

Its purpose is to help users understand how well their current professional profile aligns with the selected opportunity before generating optimized application documents.

---

## Responsibilities

The Profile Match section is responsible for:

- Comparing the user's profile with the job requirements.
- Identifying matching skills.
- Identifying missing skills.
- Highlighting professional strengths.
- Identifying potential weaknesses.
- Calculating an overall alignment assessment.
- Generating a concise recommendation based on the complete analysis.

This section does not modify the user's Master CV.

---

## Information Displayed

The Profile Match section displays the comparison results generated by the existing Profile Comparison backend.

The displayed information includes:

- Matching Skills
- Missing Skills
- Strengths
- Weaknesses
- Alignment Score (ATS Match)
- Recommendation

---

## User Actions

Users can:

- Review the complete profile comparison.
- Return to the Job Analysis if necessary.
- Continue to the Optimized CV section.

---

## Inputs

The Profile Match requires:

- Master CV
- Structured Job Analysis

---

## Outputs

The Profile Match produces:

- Matching Skills
- Missing Skills
- Strengths
- Weaknesses
- Alignment Score
- Alignment Reasoning
- Recommendation

These outputs become available for downstream AI-assisted document generation.

---

## Completion Criteria

This section is considered completed once a valid profile comparison has been successfully generated.

If either the Job Analysis or the Master CV changes, the comparison becomes outdated.

Explicit comparison regeneration is outside the current MVP.

---

## Dependencies

### Requires

- Job Analysis completed.
- Master CV available.

### Used by

- Optimized CV
- Cover Letter

---

## Navigation

Users typically arrive here after completing the Job Analysis.

Once completed, the recommended next step is:

**Optimized CV**

Users may revisit this section at any time.

---

## AI Responsibilities

The AI is responsible for:

- Comparing the user's profile with the job requirements.
- Identifying similarities and gaps.
- Calculating the alignment assessment.
- Generating a concise recommendation supported by the analysis.

The AI must not:

- Invent experience.
- Add skills that do not exist.
- Modify the Master CV.
- Recommend interview preparation.
- Suggest certifications.
- Make assumptions unsupported by the available evidence.

---

## Quality Assurance

All AI-generated outputs must satisfy the backend validation rules before becoming part of the Application Workspace.

Invalid or incomplete responses must not be propagated to downstream sections.

---

## Future Evolution

Future versions may include:

- Skill gap explanations.
- Learning roadmap suggestions.
- Salary competitiveness.
- Industry benchmarking.
- ATS scoring.
- Interactive improvement recommendations.
- Explicit comparison regeneration after comparison persistence and history are implemented.

---

# Optimized CV

## Purpose

The Optimized CV section generates a tailored version of the user's Master CV based on the structured Job Analysis and Profile Match results.

Its purpose is to produce an application-specific CV that highlights the user's most relevant experience while preserving the accuracy and integrity of the original Master CV.

---

## Responsibilities

The Optimized CV section is responsible for:

- Generating an application-specific CV.
- Prioritizing relevant experience and skills.
- Improving the professional summary.
- Adapting experience descriptions to better match the opportunity.
- Optimizing ATS-relevant keywords.
- Preserving factual accuracy.

This section never modifies the user's Master CV.

---

## Information Displayed

The Optimized CV displays:

- Generated professional summary.
- Optimized experience descriptions.
- Relevant skills.
- ATS keyword improvements.
- Live document preview.

---

## User Actions

Users can:

- Review the generated CV.
- Edit the generated content.
- Regenerate the document.
- Save the current version.
- Continue to the Cover Letter section.

---

## Inputs

The Optimized CV requires:

- Master CV.
- Structured Job Analysis.
- Profile Match results.

---

## Outputs

The Optimized CV produces:

- Application-specific CV.
- Updated professional summary.
- Optimized experience descriptions.
- ATS-focused wording.

---

## Completion Criteria

The section is considered completed once the user has reviewed and approved the optimized CV for the current application.

---

## Dependencies

### Requires

- Job Analysis completed.
- Profile Match completed.

### Used by

- Export

---

## Navigation

The recommended next step is:

**Cover Letter**

Users may regenerate the CV without affecting previous workspace sections.

---

## AI Responsibilities

The AI is responsible for:

- Rewriting content for relevance.
- Improving readability.
- Optimizing ATS terminology.
- Preserving factual information.

The AI must not:

- Invent professional experience.
- Add certifications.
- Create false achievements.
- Modify the Master CV.

---

## Quality Assurance

All generated content must satisfy backend validation before being presented to the user.

---

## Future Evolution

Future versions may include:

- Multiple CV styles.
- Industry-specific templates.
- Tone customization.
- Multi-language generation.
- Version history.

---

# Cover Letter

## Purpose

The Cover Letter section generates a personalized cover letter aligned with both the selected opportunity and the optimized CV.

Its purpose is to create a coherent narrative that complements the user's application while maintaining consistency with the information already available in the workspace.

---

## Responsibilities

The Cover Letter section is responsible for:

- Generating a personalized cover letter.
- Reflecting the job requirements.
- Maintaining consistency with the optimized CV.
- Producing a professional and concise document.

---

## Information Displayed

The Cover Letter displays:

- Generated cover letter.
- Live preview.

---

## User Actions

Users can:

- Review the generated letter.
- Regenerate the document.
- Continue to Export.

---

## Inputs

The Cover Letter requires:

- Job Analysis.
- Profile Match.
- Optimized CV.

---

## Outputs

The Cover Letter produces:

- Personalized cover letter.

---

## Completion Criteria

once the user has reviewed and approved the generated cover letter.

---

## Dependencies

### Requires

- Optimized CV completed.

### Used by

- Export

---

## Navigation

The recommended next step is:

**Export**

---

## AI Responsibilities

The AI is responsible for:

- Writing a coherent cover letter.
- Reflecting the job opportunity.
- Remaining consistent with the generated CV.

The AI must not:

- Invent experience.
- Contradict the CV.
- Introduce unsupported claims.

---

## Quality Assurance

Generated content must pass backend validation before becoming available.

---

## Future Evolution

Future versions may include:

- Multiple writing styles.
- Company-specific tone.
- Recruiter personalization.
- Multi-language support.

---

# Export

## Purpose

The Export section represents the final stage of the Fast Apply workflow.

Its purpose is to consolidate all generated application documents and prepare them for download or submission.

---

## Responsibilities

The Export section is responsible for:

-Preparing approved application documents for export.
-Generating downloadable files.
-Providing access to the final application package.

This section does not invoke AI.

It only presents or prepares information generated by previous workspace sections.

---

## Information Displayed

The Export section displays:

- Optimized CV.
- Cover Letter.
- Export status.

---

## User Actions

Users can:

- Export the CV.
- Export the Cover Letter.
- Export the complete application package.
- Return to any previous workspace section.

---

## Inputs

The Export section requires:

- Optimized CV.
- Cover Letter.

---

## Outputs

The Export section produces:

- PDF documents.
- Downloadable application package.

---

## Completion Criteria

The Application Workspace is considered completed once all required documents have been successfully exported.

---

## Dependencies

### Requires

- Optimized CV completed.
- Cover Letter completed.

### Used by

No downstream sections.

This represents the end of the Fast Apply workflow.

---

## Navigation

Users may return to any previous section to regenerate documents before exporting.

---

## AI Responsibilities

The AI has no responsibilities in this section.

The Export section only prepares existing artifacts for delivery.

---

## Quality Assurance

Only validated documents may be exported.

---

## Future Evolution

Future versions may include:

- Multiple export formats.
- Direct application integrations.
- Cloud storage.
- Shareable links.
- Versioned exports.

---
