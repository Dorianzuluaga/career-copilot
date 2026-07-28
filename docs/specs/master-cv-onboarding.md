Implement the onboarding flow that creates the user's Master CV, the single source of truth for all future AI features.

# User Flow

Authenticated User
        │
        ▼
Does Master CV exist?
        │
   ┌────┴────┐
   │         │
 Yes         No
   │         │
   ▼         ▼
Open Editor  Ask:
              "Do you already have a CV?"
                    │
          ┌─────────┴─────────┐
          │                   │
         Yes                  No
          │                   │
          ▼                   ▼
     Upload PDF         Manual Form
          │                   │
          ▼                   │
     AI extracts data          │
          │                   │
          ▼                   │
  Prefilled Form ◄────────────┘
          │
          ▼
 User reviews and edits
          │
          ▼
 Save Master CV
          │
          ▼
 Dashboard

# Functional Requirements

## Existing User

- If a Master CV exists, load it automatically.
- Open the Master CV editor.

## New User

Ask:

- Do you already have a CV?

## Options:

- Upload existing CV
- Create manually

## Upload Flow

The upload flow consists of a single endpoint.

POST /api/master-cv/upload

Responsibilities:

- Accept PDF only.
- Maximum file size: 10 MB.
- Validate file type.
- Process PDF temporarily.
- Do not persist the uploaded PDF.
- Send the document to OpenAI.
- Receive structured JSON.
- Return structured data to the frontend.
- Delete the uploaded PDF immediately after processing.

The uploaded PDF must never be stored in the database.

## AI Extraction Contract
The AI must return:

{
  "personalInformation": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": ""
  },
  "professionalSummary": "",
  "experience": [],
  "education": [],
  "skills": [],
  "languages": [],
  "certifications": []
}

Rules:

- Unknown values must be null.
- Never invent information.
- Return only structured JSON.

## Manual Flow

- Display an empty form.
- The user manually completes the information.
- Saving creates the Master CV.

## Master CV Schema
Required fields:
- Full Name
- Email
- Professional Summary
- Experience
- Skills
Optional fields:
- Phone
- Location
- LinkedIn
- Portfolio
- Education
- Languages
- Certifications

Only one Master CV exists per authenticated user.

## API

GET    /api/master-cv
POST   /api/master-cv
PUT    /api/master-cv

POST   /api/master-cv/upload

there is No /parse endpoint.

Uploading and AI extraction are handled inside /upload.

## Error Handling
- Invalid file type: Only PDF files are supported.
- File too large: Maximum file size is 10 MB.
- Empty file: The uploaded file is empty.
- Extraction failure: We couldn't extract your CV automatically.

Actions:

- Retry
- Complete manually

The user must always be able to continue manually.

## Persistence

Persist only:

- Master CV

Do not persist:

- Uploaded PDF

## Security
- Authentication required.
- Backend obtains user from session.
- Never trust client userId.
- One Master CV per authenticated user.
- Uploaded PDFs are processed temporarily and deleted immediately.

## Routing
New User:
Login
↓
Master CV Onboarding
↓
Dashboard

Existing User:
Dashboard
↓
Master CV Editor

## Out of Scope

Do not implement:

- Style Profile
- ATS Optimization
- CV Adaptation
- Cover Letter
- PDF Export
- LinkedIn Import

## Acceptance Criteria
- User without Master CV sees onboarding flow.
- User can choose between uploading an existing CV or creating one manually
- PDF uploads successfully.
- AI extracts structured information from the uploaded CV.
- The extracted information pre-fills the form.
- The user can review and edit all extracted information before saving.
- Manual flow works correctly.
- Master CV is persisted successfully.
- Existing users always open the Master CV editor.
- Only one Master CV exists per authenticated user.
- Uploaded PDFs are never persisted.
- AI returns only structured JSON.
- If AI extraction fails, the user can retry or continue manually.
