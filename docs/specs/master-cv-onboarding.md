# Master CV Onboarding Specification

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
- Restore the saved order of Experience, Education, and Personal Projects.

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
  "certifications": [],
  "personalProjects": []
}

Rules:

- Unknown values must be null.
- Never invent information.
- Return only structured JSON.
- If no Personal Projects are present in the uploaded CV, return an empty `personalProjects` array.
- Preserve the order in which Experience, Education, and Personal Projects are identified in the source document.
- Do not create Personal Projects that are not supported by the uploaded CV.

## Manual Flow

- Display an empty form.
- The user manually completes the information.
- Saving creates the Master CV.

The manual form must allow users to:

- Add Experience entries.
- Add Education entries.
- Add Personal Project entries.
- Edit existing entries.
- Remove entries.
- Reorder Experience entries.
- Reorder Education entries.
- Reorder Personal Project entries.

The user-defined order must be preserved when the Master CV is saved and subsequently loaded.

## Personal Projects

Personal Projects are optional.

Users may add zero or more Personal Projects to their Master CV.

Each Personal Project may contain:

- Project name
- Brief description
- Technologies
- Project URL

The project name and brief description identify the project.

Technologies and Project URL are optional.

Users may:

- Add a project.
- Edit a project.
- Remove a project.
- Reorder projects.

Personal Projects are part of the Master CV and therefore become available as factual source information for future AI features.

If the user has no Personal Projects, the Master CV remains valid without them.

The application must never create a Personal Project automatically unless the information is explicitly provided by the user or extracted from an uploaded CV.

## Ordering

The order of Experience, Education, and Personal Projects is user-controlled.

The order of each collection is independent.

For example:

Experience:

1. BigTrail Magazine
2. TechNova Solutions
3. Previous Company

Education:

1. DAW
2. Full-Stack AI
3. Full-Stack Developer
4. International Business

Personal Projects:

1. Career Copilot
2. AI Developer Copilot

The order of each array represents the user's intended presentation order.

No separate `displayOrder` field is required.

The application must preserve the order of each collection when:

- Displaying the Master CV.
- Saving the Master CV.
- Loading the Master CV.
- Passing Master CV data to future AI features.
- Rendering future documents based on the Master CV.

The application must not automatically reorder Experience or Education based on dates, creation time, relevance, or any other inferred rule.

AI extraction should preserve the order found in the uploaded document, but the user remains responsible for reviewing and changing that order before saving.

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
- Personal Projects

Only one Master CV exists per authenticated user.

## API

GET    /api/master-cv
POST   /api/master-cv
PUT    /api/master-cv

POST   /api/master-cv/upload

There is No /parse endpoint.

Uploading and AI extraction are handled inside /upload.

The API must preserve the order of Experience, Education, and Personal Projects provided by the client.

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

Personal Projects are persisted as part of the Master CV.

The order of Experience, Education, and Personal Projects is persisted as part of the Master CV data.

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
- AI-based automatic reordering of Experience
- AI-based automatic reordering of Education
- AI-based automatic reordering of Personal Projects
- Project recommendations
- Project generation
- Project enrichment using external sources

## Acceptance Criteria

- User without Master CV sees onboarding flow.
- User can choose between uploading an existing CV or creating one manually.
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

### Personal Projects

- User can add Personal Projects to the Master CV.
- User can edit Personal Projects.
- User can remove Personal Projects.
- User can leave Personal Projects empty.
- Each Personal Project supports a project name and brief description.
- Technologies are optional.
- Project URL is optional.
- Personal Projects are persisted as part of the Master CV.
- Uploaded CVs can populate Personal Projects when projects are explicitly present in the source document.
- The AI must not invent Personal Projects.

### Ordering

- User can reorder Experience entries.
- User can reorder Education entries.
- User can reorder Personal Project entries.
- Experience, Education, and Personal Projects have independent ordering.
- The user-defined order is preserved after saving.
- The user-defined order is restored when reopening the Master CV.
- The order is represented by the order of each collection.
- The application does not automatically reorder these collections based on dates, relevance, or creation time.
- Future AI features receive the Master CV using the user's saved ordering.

# Implementation Notes

The Master CV remains the single source of truth.

Personal Projects are additional factual source information and must be treated with the same factual integrity as Experience, Education, Skills, Languages, and Certifications.

The Master CV editor should reuse the existing patterns for collection-based fields whenever possible.

Reordering should be implemented as a user-controlled interaction and should update the underlying collection order before persistence.

No separate ordering field is required unless the existing architecture makes array ordering technically impossible to persist reliably.

Future AI features may select or adapt Personal Projects according to the target application, but must not modify the Master CV.

The Master CV order represents user preference, not necessarily chronological order.

No assumptions should be made about chronological ordering.
