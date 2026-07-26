# Feature Specification

## Feature

Application Workspace

Status: Approved

Priority: P0 (MVP)

---

# Overview

The Application Workspace is the central working area of Career Copilot.

It allows users to create and manage a job application in one place.

For the MVP, the workspace focuses on manually creating and organizing applications.

Future versions will integrate AI-assisted analysis and document generation.

---

# Goal

Provide users with a simple workflow to:

- Create an application.
- View all applications.
- Open an application workspace.
- Prepare the foundation for future AI features.

---

# Scope

Included

- Dashboard
- Create Application
- Application Workspace
- In-memory state
- Responsive UI

Not Included

- Authentication
- Google OAuth
- AI analysis
- PostgreSQL
- Prisma
- API
- PDF generation
- ATS analysis

---

# User Flow

Dashboard

↓

Create Application

↓

Complete Form

↓

Save

↓

Dashboard updates

↓

Open Application Workspace

OR

↓

Edit Application

↓

Save

↓

Dashboard updates

OR

↓

Delete Application

↓

Confirm

↓

Dashboard updates

---

# Functional Requirements

The user can:

- Create a new application.
- View existing applications.
- Open an application.
- Edit application information.
- Delete an application.
- Navigate between pages.

---

# UI Requirements

## Dashboard

- Page title
- "New Application" button
- Application cards

## Create Application

The application form must contain:

- Company Name input (required)
- Job Title input (required)
- Location input (optional)
- Job URL input (optional)
- Job Description textarea (required)
- Save button
- Cancel button

## Application Workspace

- Header
- Application information
- Display the complete Job Description
- AI Analysis (Coming Soon)
- Generated Documents (Coming Soon)
- Footer

---

# Placeholder Content

The Application Workspace must display the following placeholder sections:

## AI Analysis

Title:
AI Analysis

Content:
Coming Soon

## Generated Documents

Title:
Generated Documents

Content:
Coming Soon

These placeholders are visual only and do not contain any functionality.

---

# Business Rules

- Every application has a unique id.
- Company name is required.
- Job title is required.
- Job Description is required.
- Location is optional.
- Job URL is optional.
- Data is stored only in memory.
- No backend requests.
- No authentication.
- No persistence after refresh.

---

# Data Model

Application

- id
- companyName
- jobTitle
- location
- jobUrl
- jobDescription
- createdAt

---

### Edit Application

The user can edit an existing application.

The Create Application form is reused for editing.

The form is pre-filled with the current application data.

Saving updates the existing application.

---

### Delete Application

The user can delete an application from the Dashboard.

Deleting requires user confirmation.

After deletion, the Dashboard is updated immediately.

---

# Acceptance Criteria

Given the dashboard

When the user creates an application

Then the application appears in the dashboard.

---

Given the Create Application form

When the user enters a Job Description and saves

Then the Job Description is stored as part of the application.

---

Given an existing application

When the user opens it

Then the Application Workspace is displayed and the complete Job Description is visible.

---

Given an application

When the user edits it

Then the updated information is shown.

---

Given an application

When the user deletes it

Then it disappears from the dashboard.

---

# Out of Scope

- AI
- Cover Letter
- CV generation
- PDF
- Authentication
- Database
- API

---

# Future Improvements

- AI Analysis
- Master CV adaptation
- Automatic Job Description extraction from URL
- Cover Letter
- ATS score
- Timeline
- Interview tracking
- LinkedIn integration
