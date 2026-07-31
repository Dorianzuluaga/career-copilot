# Job Analysis 2 Specification

## Overview

Job Analysis 2 extends the analysis performed in job-analysis.md

While the previous Epic extracted structured information from the Job Description, this Epic compares that information against the user's Master CV to evaluate how well the user's current professional profile aligns with the job opportunity.

The objective is to provide actionable insights before generating an optimized CV.

This Epic does not modify either the Job Offer or the Master CV.

It only produces an analysis based on both sources.

---

# Business Goal

Help users quickly understand whether they are a good fit for a job opportunity before investing time in adapting or generating a tailored CV.

Career Copilot should behave like an intelligent career assistant, providing realistic and actionable feedback instead of simply matching keywords.

---

# User Story

As a user,

I want Career Copilot to compare my Master CV with the structured Job Analysis generated for the selected Job Offer.

so that I can understand my current strengths, weaknesses and overall alignment before generating an optimized CV.

---

# Workflow

Application
│
▼
Persisted Job Offer
│
▼
Persisted Job Analysis
│
▼
Persisted Master CV
│
▼
Profile Comparison Engine
│
▼
Comparison Result
│
├── ATS Match
├── Matching Skills
├── Missing Skills
├── Strengths
├── Weaknesses
└── Recommendation

---

# Functional Requirements

## Phase 1 — Compare Master CV vs Job Offer

The system must compare:

- The authenticated user's active Master CV.
- The structured Job Analysis associated with the current Application Workspace.

The comparison must always use the active Master CV associated with the authenticated user.

The comparison must use the Job Analysis associated with the current Application Workspace.

The comparison must use the structured information already generated in Job Analysis.

The original Job Description must not be analyzed again.

The comparison must not modify any stored information.

---

## Phase 2 — Matching Skills

The AI must identify the professional skills already covered by the user's Master CV.

Only skills reasonably supported by the Master CV should be considered matching.

The result must be returned as a concise list.

Example:

- React
- TypeScript
- REST APIs
- Git

---

## Phase 3 — Missing Skills

The AI must identify important skills required by the Job Offer that are not sufficiently represented in the Master CV.

Only relevant missing skills should be returned.

The objective is to help the user understand what is currently missing.

The result must be returned as a concise list.

Example:

- Docker
- AWS
- Unit Testing

---

## Phase 4 — Strengths

The AI must identify the strongest aspects of the user's profile in relation to the Job Offer.

Strengths may include:

- Technical skills
- Professional experience
- Technologies
- Education
- Relevant responsibilities
- Domain knowledge

Each list should contain between 3 and 5 concise items whenever sufficient information exists.

If insufficient evidence exists, the AI should return fewer items rather than inventing content.

The output must be concise.

---

## Phase 5 — Weaknesses

The AI must identify areas where the user's profile appears weaker compared to the Job Offer.

Weaknesses should be constructive rather than negative.

The objective is to help improve future applications.

Each list should contain between 3 and 5 concise items whenever sufficient information exists.

If insufficient evidence exists, the AI should return fewer items rather than inventing content.

The output must be concise.

---

## Phase 6 — Profile Alignment Score

The system must return a single integer between **0 and 100** representing the estimated readiness of the current Master CV for the analyzed Job Opportunity.

The score is displayed in the user interface as **ATS Match**.

The Profile Alignment Score is intended to help the user understand how closely the current profile aligns with the analyzed Job Opportunity at the present moment.

It is designed to provide realistic guidance for improving the current application rather than predicting recruitment outcomes.

The Profile Alignment Score is NOT:

- a prediction of interview success;
- a prediction of hiring probability;
- an ATS algorithm result;
- a guarantee of any recruitment outcome.

The AI must evaluate the complete profile comparison using the approved outputs generated during the previous phases:

- Matching Skills
- Missing Skills
- Strengths
- Weaknesses

The final score must represent the overall alignment between the candidate's current Master CV and the analyzed Job Opportunity.

The evaluation must be:

- evidence-based;
- realistic;
- internally consistent;
- balanced.

The score should encourage informed improvement without creating unrealistic expectations or unnecessarily discouraging the user.

When uncertainty exists, prefer balanced evaluations over extreme values.

Avoid assigning **0%** or **100%** unless the available evidence overwhelmingly justifies those values.

---

The AI should evaluate the profile holistically.

The final score must not be calculated as a simple arithmetic formula based on the number of matching or missing skills.

Professional experience, relevance of strengths, and the overall quality of the profile should also influence the final evaluation whenever supported by evidence.

### Internal Reasoning

In addition to the numeric score, the AI must generate a concise internal explanation describing the primary factors that influenced the calculated score.

This explanation is intended exclusively for internal system use.

It must NOT be displayed in the MVP user interface.

The reasoning may be used in future versions for:

- explainability;
- debugging;
- auditing;
- score consistency validation;
- advanced AI coaching features.

---

### Response Contract

The comparison response is incrementally extended with the following fields:

```ts
alignmentScore: number;

alignmentReasoning: string;
```

Where:

- `alignmentScore` is an integer between **0** and **100**.
- `alignmentReasoning` is a concise internal explanation supporting the calculated score.

The internal reasoning is part of the API contract but is not part of the MVP presentation layer.

Frontend clients may safely ignore this field until future product versions require explainability features.

---

## Phase 7 — Recommendation

The AI must generate one concise recommendation based on the complete profile comparison.

The recommendation should be based on the overall Profile Alignment Score together with the evidence produced during the previous comparison phases (matching skills, missing skills, strengths and weaknesses).

The Alignment Score summarizes the evaluation, while the recommendation provides the next high-level action consistent with that evaluation.

High scores should encourage proceeding with the application.

Medium scores should encourage improving the CV before applying.

Low scores should recommend strengthening the profile before applying.

The recommendation should help the user decide whether to continue with the application.

The recommendation must not introduce new analysis, assumptions, or evidence.

It must be fully supported by the previous comparison outputs.

The recommendation should provide only a high-level next step.

Detailed coaching or improvement suggestions are outside the scope of this MVP.

Examples:

Excellent alignment.

Good opportunity. Consider adapting your CV before applying.

Moderate alignment. Your profile matches many requirements, although several important skills are currently missing.

Low alignment. Consider strengthening your profile before applying.

Recommendations must be concise.

Maximum length:

2–3 sentences.

---

## Alignment Evaluation Criteria

The Profile Alignment Score should be estimated by evaluating the overall alignment between the user's Master CV and the analyzed Job Analysis.

The AI should prioritize the following criteria in descending order of importance:

### 1. Required Skills (Highest Priority)

The comparison should primarily evaluate whether the required technical skills, tools and technologies are represented in the user's Master CV.

Missing mandatory skills should significantly reduce the alignment score.

---

### 2. Relevant Professional Experience

The AI should evaluate whether the user's previous experience demonstrates work similar to the responsibilities described in the Job Offer.

Relevant experience may compensate for minor missing skills.

---

### 3. Responsibilities and Domain Knowledge

The AI should compare previous responsibilities with those expected for the position.

Experience in similar business domains should positively influence the alignment.

---

### 4. Education and Certifications

Education should be considered only when relevant to the position.

For most technology roles, education has lower impact than demonstrated skills and experience.

---

### 5. Relevant Keywords

The AI should consider important terminology present in both documents.

Keywords alone should never outweigh actual experience or demonstrated skills.

---

The final Profile Alignment Score should represent the overall profile alignment rather than the sum of individual keyword matches.

# AI Design Principles

The objective of this analysis is not to predict whether the candidate will be hired.

The objective is to evaluate how well the current Master CV aligns with the analyzed Job Offer.

The AI should always prioritize realistic and actionable guidance over optimistic scoring.

The AI should never inflate the alignment score to encourage applications.

# AI Requirements

The AI receives:

- Master CV
- Structured Job Analysis

The AI must base its analysis exclusively on the information contained in these two sources.

If either the Master CV or the Job Analysis lacks sufficient information, the AI should base its evaluation only on the available evidence instead of making assumptions.

The AI must NOT:

- Invent experience
- Invent skills
- Modify the Master CV
- Modify the Job Analysis
- Promise employment
- Exaggerate the ATS Match

The AI should behave as a professional career advisor.

---

# Response Contract

The backend must receive a structured JSON response.

Example:

```json
{
  "profileAlignmentScore": 82,
  "matchingSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "recommendation": ""
}
```

The frontend displays `profileAlignmentScore` as **ATS Match**.

All list fields must contain plain strings.

No nested objects are required for the MVP.

All arrays may be empty if no evidence is available.

The AI must never fabricate items to populate the response.

This JSON becomes the contract between Backend and Frontend.

---

# UI Requirements

The comparison results should be displayed in a dedicated section inside the Application Workspace.

The UI should present:

ATS Match

Matching Skills

Missing Skills

Strengths

Weaknesses

Recommendation

The interface should prioritize readability over excessive detail.

---

# Non Functional Requirements

The comparison should complete within a reasonable response time.

Given similar inputs, the response should remain reasonably consistent in both content and alignment score.

The response should be concise.

Avoid unnecessary paragraphs.

Lists should contain only meaningful items.

---

# Out of Scope

This Epic does NOT include:

CV generation

Cover Letter generation

CV rewriting

Master CV editing

Job Offer editing

Application status management

Timeline management

Interview preparation

Learning plans

Profile enrichment

Skill recommendations beyond the short Recommendation section

---

# Acceptance Criteria

The user can compare an existing Master CV against an analyzed Job Offer.

The user receives:

- ATS Match
- Matching Skills
- Missing Skills
- Strengths
- Weaknesses
- Recommendation

The comparison does not modify any stored data.

The response follows the defined JSON contract.

The comparison always uses the authenticated user's active Master CV and the Job Analysis associated with the current Application Workspace.

The analysis is realistic, concise and actionable.

---

# Implementation Phases

The implementation must be completed incrementally.

During incremental implementation, temporary responses may include only the fields implemented in the current phase.

The complete response contract becomes mandatory once all implementation phases have been completed.

Phase 1

Compare Master CV vs Job Analysis

Phase 2

Matching Skills

Phase 3

Missing Skills

Phase 4

Strengths

Phase 5

Weaknesses

Phase 6

Profile Alignment Score

Phase 7

Recommendation

Each phase must be independently testable.

The recommendation must be based exclusively on the comparison results generated during this analysis.

It must not introduce new information that was not identified during the comparison.

No future phase should be implemented before its corresponding implementation task is approved.

# Assumptions

This specification assumes that:

- An authenticated user already exists.
- An active Master CV already exists.
- A completed Job Analysis already exists.
- The current Application Workspace has access to both resources.
