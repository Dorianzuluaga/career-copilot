# Feature Specification — Job Analysis

## Objective

Allow authenticated users to create a new job application by pasting a job description.

The system must:

- Validate the job description.
- Save the original job offer.
- Analyze the job description using OpenAI.
- Extract structured information.
- Store the analysis.
- Create the initial Application entity that will become the central workspace for all future AI features.

This feature DOES NOT compare the Job Offer with the Master CV.
That belongs to the next Epic.

---

# User Flow

Authenticated User

↓

Dashboard

↓

Create Application

↓

Paste Job Description

↓

Validate Job Description

↓

Create Application

↓

Save Original Job Offer

↓

Analyze with OpenAI

↓

Extract Structured Information

↓

Store Job Analysis

↓

Redirect to Application Workspace

---

# Functional Requirements

## FR-1 Create Application

When the user starts a new application the system must create an Application entity.

Initial status:

NEW

The Application will become the parent entity for:

- Job Offer
- Job Analysis
- ATS Match
- Generated CV
- Cover Letter
- Timeline
- Application Status

No comparison with Master CV happens yet.

---

## FR-2 Paste Job Description

The user can paste a complete job description.

Supported input:

Plain text only.

Files are NOT supported in this Epic.

The user may:

- paste
- edit
- replace

before submitting.

---

## FR-3 Validate Job Description

Validation rules:

Required.

Minimum length:

300 characters.

Maximum length:

25000 characters.

Errors:

Job description is required.

The job description is too short.

The job description exceeds the maximum allowed length.

The Analyze button remains disabled while validation fails.

---

## FR-4 Save Original Job Offer

The original description must always be stored.

The system must never overwrite it after AI analysis.

Fields:

id

applicationId

title

company

originalDescription

createdAt

updatedAt

If title or company cannot be inferred:

null

The AI must never invent values.

---

## FR-5 Analyze Job Description

The backend sends the original description to OpenAI.

The response must follow the schema below.

Unknown values must return:

null

Never generate fictional information.

---

## FR-6 Job Analysis Schema

The AI returns:

```json
{
  "title": "",
  "company": "",
  "employmentType": "",
  "location": "",
  "experienceLevel": "",
  "education": "",
  "languages": [],
  "summary": "",
  "requiredSkills": [],
  "responsibilities": [],
  "atsKeywords": []
}
```

---

## FR-7 Extract Required Skills

Examples:

React

TypeScript

Node.js

Express

Docker

AWS

Remove duplicates.

Preserve original wording whenever possible.

---

## FR-8 Extract Responsibilities

Examples:

Develop frontend features

Build REST APIs

Review pull requests

Write automated tests

Maintain documentation

Responsibilities should remain concise.

---

## FR-9 Extract ATS Keywords

Extract only keywords relevant for Applicant Tracking Systems.

Examples:

React

REST API

Git

Agile

CI/CD

Docker

PostgreSQL

Node.js

No duplicates.

Do not invent technologies.

---

## FR-10 Save Job Analysis

The structured analysis must be persisted.

Fields:

applicationId

title

company

employmentType

location

experienceLevel

education

languages

summary

requiredSkills

responsibilities

atsKeywords

analysisVersion

createdAt

updatedAt

---

# Database Design

## Application

Parent entity.

Contains:

id

userId

status

createdAt

updatedAt

Future relationships:

JobOffer

JobAnalysis

ATSMatch

GeneratedCV

CoverLetter

Timeline

---

## JobOffer

Stores the original pasted description.

---

## JobAnalysis

Stores the structured AI output.

---

# API

Create Application

POST

/api/applications

Returns:

Application ID

---

Save Job Description

POST

/api/applications/:id/job-offer

---

Analyze Job Description

POST

/api/applications/:id/job-analysis

Returns:

Structured Job Analysis

---

Get Application

GET

/api/applications/:id

---

# Error Handling

Validation failure:

Display validation errors.

OpenAI failure:

We couldn't analyze this job description.

Actions:

Retry

Edit Job Description

Database failure:

Unexpected error.

Try again later.

---

# Persistence Rules

Always store:

Original Job Description.

Always store:

Structured Job Analysis.

Never overwrite the original text.

Never save partial AI responses.

---

# Security

Authentication required.

Every Application belongs to one user.

Users cannot access applications from other users.

---

# Routing

Dashboard

↓

Create Application

↓

Job Analysis

↓

Application Workspace

---

# Out of Scope

The following belong to the next Epic:

Compare Master CV vs Job Offer

Calculate ATS Match

Missing Skills

Matching Skills

Recommendations

Generate Optimized CV

Generate Cover Letter

Export PDF

---

# Acceptance Criteria

The user can create an Application.

The user can paste a job description.

Validation prevents invalid submissions.

The original job description is stored.

OpenAI analyzes the description.

The structured analysis is stored.

Required Skills are extracted.

Responsibilities are extracted.

ATS Keywords are extracted.

The Application Workspace is created.

The user is redirected to the Application Workspace.

Future features can reuse the stored Application.