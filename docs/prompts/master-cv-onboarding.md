1.

Read the Workspace Rules first.

Implement the Master CV Onboarding feature.

Objective

Create the onboarding flow that generates the user's Master CV.

Requirements

Existing users:

- Load existing Master CV.
- Open editor.

New users:
Ask:
"Do you already have a CV?"

Options:

- Upload existing CV
- Create manually

Upload Flow

- Upload PDF.
- Backend receives PDF.
- AI extracts:
  - Personal Information
  - Professional Summary
  - Experience
  - Education
  - Skills
  - Languages
- Return structured data.
- Prefill form.
- User reviews and edits.
- Save Master CV.

Manual Flow

- Empty form.
- User completes information.
- Save Master CV.

API

GET /api/master-cv
POST /api/master-cv
PUT /api/master-cv

POST /api/master-cv/upload
POST /api/master-cv/parse

Security

- Authenticated users only.
- Never trust client userId.
- Obtain user from backend session.
- One Master CV per authenticated user.

Follow the existing project architecture.

Additional implementation decisions

Master CV Schema

Required:

- Full Name
- Email
- Professional Summary
- Experience
- Skills

Optional:

- Phone
- Location
- LinkedIn
- Portfolio
- Education
- Languages
- Certifications

Upload API

POST /api/master-cv/upload

Responsibilities:

- Accept PDF only.
- Maximum 10 MB.
- Process temporarily.
- Do NOT persist the uploaded PDF.
- Send PDF to OpenAI.
- Return structured JSON.

The uploaded PDF must be deleted immediately after processing.

Remove the separate /parse endpoint from the implementation.

Extraction contract

Return:

{
personalInformation,
professionalSummary,
experience,
education,
skills,
languages,
certifications
}

Unknown values must be null.
Never invent information.

If extraction fails:

Show:

"We couldn't extract your CV automatically."

Actions:

- Retry
- Complete manually

Style Profile is explicitly OUT OF SCOPE for this feature.

Routing

New user:
Login
→ Master CV Onboarding
→ Dashboard

Existing user:
Dashboard
→ Master CV Editor

When implementation is complete provide:

1. Files created
2. Files modified
3. Architecture decisions
4. User flow implemented
5. Deviations
6. Remaining work

If implementation cannot continue because the specification is ambiguous, stop immediately and explain exactly what is missing.

2.

Implement the following UX improvement.

Inside the Master CV editor, add an "Import Existing CV" action that allows users to upload a new PDF at any time.

Requirements:

- The action must be available after a Master CV already exists.
- Upload a PDF using the existing upload flow.
- Reuse the existing AI extraction service.
- Prefill the editor with the extracted information.
- Ask the user for confirmation before replacing the current data.
- If the user cancels, keep the existing Master CV unchanged.
- If the user confirms, replace the form values with the extracted data and allow further manual editing before saving.
- Do not create a new Master CV.
- Update the existing Master CV only after the user explicitly saves.

Follow the existing project architecture.

If any requirement is ambiguous, stop and ask before implementing.
