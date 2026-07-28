Implement the complete "Job Analysis" feature according to the project specifications.

Before writing any code you MUST read:

docs/product/
docs/architecture/
docs/engineering/
docs/specs/job-analysis.md
PROJECT_RULES.md
DEVELOPMENT_GUIDE.md

Follow every documented project rule.

Do not make architectural decisions that contradict existing documentation.

---

## Objective

Implement the complete Job Analysis workflow.

This feature allows authenticated users to:

- Create an Application
- Paste a Job Description
- Validate it
- Store the original Job Offer
- Analyze it using OpenAI
- Extract structured information
- Persist the analysis
- Redirect to the Application Workspace

Do NOT implement ATS Match.

Do NOT compare with Master CV.

Do NOT generate CVs.

Do NOT generate Cover Letters.

---

## Backend

Create the necessary Prisma models.

Application

JobOffer

JobAnalysis

Create migrations.

Create repositories.

Create services.

Create controllers.

Create routes.

Protect every endpoint using the existing authentication middleware.

Reuse existing OpenAI infrastructure.

Use the Responses API.

Return structured JSON only.

---

## Frontend

Create the Job Analysis page.

Allow users to:

Paste

Edit

Validate

Analyze

Display loading state.

Display extraction errors.

Redirect to Application Workspace after successful analysis.

---

## Validation

Required.

300–25000 characters.

Plain text only.

---

## OpenAI Contract

The AI response MUST follow:

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

Unknown values:

null

Never fabricate information.

---

## Persistence

Store:

Application

Original Job Offer

Structured Job Analysis

Never overwrite the original description.

---

## Security

Authenticated users only.

Every Application belongs to one user.

---

## Code Quality

Reuse existing architecture.

Keep separation of concerns.

No duplicated logic.

Strong typing.

Update tests where necessary.

Run:

- lint
- typecheck
- tests

Summarize every file created and modified before finishing.

Application creation, JobOffer persistence and JobAnalysis persistence are intentionally implemented as three sequential API operations.

Atomicity is guaranteed per request.

Cross-request atomic transactions are intentionally not used because the workflow is resumable and follows the product architecture.
