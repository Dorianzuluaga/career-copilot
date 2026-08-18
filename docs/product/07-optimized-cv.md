# Career Copilot — Optimized CV

## Purpose

The Optimized CV is a job-specific version of the user's Master CV generated for a single application.

Its purpose is to adapt the user's existing professional experience to the requirements of a specific job opportunity while preserving the Master CV as the single source of truth.

This adaptation focuses on improving the presentation of existing information rather than changing the user's professional background.

The Optimized CV belongs exclusively to one Application Workspace and represents the document that users will review, edit, and eventually export after completing the Fast Apply workflow.

## Design Philosophy

The Optimized CV is not a new CV.

It is an adaptation of the user's Master CV for a specific job opportunity.

Career Copilot never replaces the user's professional history or creates professional information that does not exist in the Master CV..

Instead, it reorganizes, emphasizes, selects, and improves existing information according to the requirements identified during Job Analysis and Profile Match.

This includes Personal Projects when they are relevant to the target job opportunity.

Users always remain in control of the generated document through manual review and editing before export.

## Workspace Position

The Optimized CV is the fourth stage of the Application Workspace.

It becomes available after the Profile Match has been completed.

Its output becomes the foundation for future Cover Letter generation and PDF Export.

## Inputs

The Optimized CV is generated using:

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

These inputs provide the context required to produce a job-specific version of the user's CV.

## Output

The output is an editable Optimized CV.

The generated document is intended for user review before any export operation.

Generating the Optimized CV does not automatically generate a PDF.

The generated document remains associated with its Application Workspace.

The Optimized CV may include a Personal Projects section when one or more projects from the Master CV are relevant to the target job opportunity.

Personal Projects are optional. If no relevant Personal Projects exist, the Optimized CV does not include a Personal Projects section.

## Product Principles

The Optimized CV follows these principles:

- Preserve the Master CV as the single source of truth.
- Never fabricate professional experience or project information.
- Maximize the relevance of existing information without changing its factual meaning.
- Adapt existing content instead of inventing new information.
- Select only relevant Personal Projects from the Master CV.
- Prioritize relevance over quantity.
- Improve clarity and ATS compatibility.
- Preserve factual accuracy.
- Keep the user in control through manual editing.
- Generate one Optimized CV per application.
- Never modify the Master CV during Optimized CV generation or editing.

## Personal Projects

Personal Projects are optional application content sourced exclusively from the user's Master CV.

The AI may evaluate Personal Projects against the Job Analysis and Profile Match to determine whether they provide relevant evidence for the target position.

The AI may:

Include relevant Personal Projects.
Omit irrelevant Personal Projects.
Prioritize the most relevant projects when multiple projects are available.
Adapt the project description for relevance while preserving its factual meaning.

The AI must never:

Invent a Personal Project.
Create a project that does not exist in the Master CV.
Invent technologies used in a project.
Invent project URLs.
Invent project achievements or outcomes.
Alter factual project information.

If no Personal Project provides meaningful relevance to the target job, the Optimized CV should omit the Personal Projects section.

The presence or absence of Personal Projects in the Optimized CV does not modify the Master CV.

## AI Boundaries

The AI may:

- Rewrite existing content.
- Improve wording.
- Reorganize information.
- Reorder information within the generated Optimized CV when relevant to the target application.
- Emphasize relevant experience.
- Evaluate and select relevant Personal Projects.
- Adapt Personal Project descriptions while preserving factual meaning.
- Improve ATS compatibility.

The AI must never:

- Invent professional experience.
- Invent Personal Projects.
- Modify employment dates.
- Create fictitious projects.
- Change company names.
- Fabricate certifications.
- Invent project technologies, URLs, achievements, or outcomes.
- Alter personal information.
- Modify factual meaning.

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
- Personal Project descriptions
- User-added application-specific notes (if supported)

Personal Project identity information sourced from the Master CV remains protected.

The following information remains read-only because it belongs to the Master CV:

- Personal information
- Employment dates
- Company names
- Job titles
- Education identity
- Certifications identity
- Personal Project names
- Personal Project technologies
- Personal Project URLs

Changes to factual profile information must always be performed in the Master CV.
