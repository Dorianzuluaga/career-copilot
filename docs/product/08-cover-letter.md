# Career Copilot — Cover Letter

## Purpose

The Cover Letter is an application-specific document generated for a single Application Workspace.

Its purpose is to help users present their motivation, relevant experience, and professional value in a concise and professional way while preserving factual accuracy.

The Cover Letter belongs exclusively to one Application Workspace and is intended to complement the Optimized CV during the Fast Apply workflow.

---

## Design Philosophy

The Cover Letter is not an introduction written from scratch.

It is a professional adaptation generated from the user's existing information and the context of the current job opportunity.

Career Copilot never invents personal motivations, professional experience, or company knowledge.

Instead, it connects the user's real experience with the requirements identified during Job Analysis, Profile Match, and the generated Optimized CV.

The Cover Letter complements the Optimized CV instead of repeating it.

Users always remain in control through manual review and editing before export.

---

## Workspace Position

The Cover Letter is the fifth stage of the Application Workspace.

It becomes available only after a valid Optimized CV has been saved.

Its output becomes one of the documents included during the Export workflow.

---

## Inputs

The Cover Letter is generated using:

- Master CV
- Job Analysis
- Profile Match
- Optimized CV

The Optimized CV is the primary document reference.

The remaining inputs provide contextual information for the generated letter.

---

## Output

The output is an editable Cover Letter.

Generating the Cover Letter does not automatically generate a PDF.

The Cover Letter should normally fit on a single page.

The generated Cover Letter should normally contain between **200 and 400 words**, while remaining concise, professional, and relevant to the target position.

---

## Document Structure

The generated Cover Letter should contain:

- Header
- Greeting
- Introduction
- Professional Value
- Motivation
- Closing
- Signature

### Header

The header may include:

- Candidate name
- Email
- Phone number (if available)
- Current date
- Company name (if available)

### Greeting

If the recruiter's name is available, the letter should address that person.

If no recruiter information is available, the Cover Letter must use a professional generic greeting.

Otherwise, the AI should generate a professional generic greeting.

### Introduction

A brief introduction including:

- Who the candidate is.
- The position being applied for.
- A concise introduction to the application.

### Professional Value

This section summarizes the candidate's most relevant experience, skills, and achievements for the target position.

It should connect the candidate's background with the job opportunity without repeating the entire Optimized CV.

### Motivation

This section explains why the candidate is interested in the opportunity.

When the Job Analysis contains meaningful information about the company, products, mission, or values, the Cover Letter may naturally reference that information.

When such information is unavailable, the motivation should remain professional and generic without making unsupported claims.

### Closing

A short professional closing that:

- Thanks the recruiter.
- Expresses availability for an interview.

### Signature

The signature contains only the user's name.

---

## Product Principles

The Cover Letter follows these principles:

- Preserve factual accuracy.
- Never invent professional experience.
- Never invent company information.
- Connect the user's experience with the job requirements.
- Complement the Optimized CV instead of repeating it.
- Use a professional, confident, and natural tone.
- Avoid exaggerated or overly emotional language.
- Keep the user in control through manual editing.
- Generate one Cover Letter per application.

---

## AI Boundaries

The AI may:

- Improve wording.
- Rewrite sentences.
- Organize ideas.
- Adapt tone.
- Connect existing experience with the job opportunity.
- Generate professional transitions.

The AI must never:

- Invent professional experience.
- Invent personal motivations.
- Invent company information.
- Infer company values that are not explicitly present in the Job Analysis.
- Claim knowledge about the company that is not supported by the Job Analysis.
- Fabricate achievements.
- Modify factual information from the user's profile.
- Promise future performance or outcomes.

After generation, users become responsible for any manual modifications they perform.
