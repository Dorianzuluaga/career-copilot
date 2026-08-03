# Career Copilot — Optimized CV

## Purpose

The Optimized CV is a job-specific version of the user's Master CV generated for a single application.

Its purpose is to adapt the user's existing professional experience to the requirements of a specific job opportunity while preserving the Master CV as the single source of truth.

This adaptation focuses on improving the presentation of existing information rather than changing the user's professional background.

The Optimized CV belongs exclusively to one Application Workspace and represents the document that users will review, edit, and eventually export after completing the Fast Apply workflow.

## Design Philosophy

The Optimized CV is not a new CV.

It is an adaptation of the user's Master CV for a specific job opportunity.

Career Copilot never replaces the user's professional history.

Instead, it reorganizes, emphasizes, and improves existing information according to the requirements identified during Job Analysis and Profile Match.

Users always remain in control of the generated document through manual review and editing before export.

## Workspace Position

The Optimized CV is the fourth stage of the Application Workspace.

It becomes available after the Profile Match has been completed.

Its output becomes the foundation for future Cover Letter generation and PDF Export.

## Inputs

The Optimized CV is generated using:

- Master CV
- Job Analysis
- Profile Match

These inputs provide the minimum context required to produce a job-specific version of the user's CV.

## Output

The output is an editable Optimized CV.

The generated document is intended for user review before any export operation.

Generating the Optimized CV does not automatically generate a PDF.

The generated document remains associated with its Application Workspace.

## Product Principles

The Optimized CV follows these principles:

- Preserve the Master CV as the single source of truth.
- Never fabricate professional experience.
- Maximize the relevance of existing information without changing its factual meaning.
- Adapt existing content instead of inventing new information.
- Prioritize relevance over quantity.
- Improve clarity and ATS compatibility.
- Preserve factual accuracy.
- Keep the user in control through manual editing.
- Generate one Optimized CV per application.

## AI Boundaries

The AI may:

- Rewrite existing content.
- Improve wording.
- Reorder information.
- Emphasize relevant experience.
- Improve ATS compatibility.

The AI must never:

- Invent professional experience.
- Modify employment dates.
- Create fictitious projects.
- Change company names.
- Fabricate certifications.
- Alter personal information.

## User Responsibility

Career Copilot generates an optimized version of the user's Master CV using only the information available within the application context.

Users remain responsible for reviewing, editing, and validating the generated document before using it in a job application.

Any manual modifications performed after generation become the user's responsibility.

## Editable Content

The Optimized CV allows users to edit only application-specific content.

Editable content includes:

- Professional Summary
- Experience descriptions
- Skills
- User-added application-specific notes (if supported)

The following information remains read-only because it belongs to the Master CV:

- Personal information
- Employment dates
- Company names
- Job titles
- Education identity
- Certifications identity

Changes to factual profile information must always be performed in the Master CV.
