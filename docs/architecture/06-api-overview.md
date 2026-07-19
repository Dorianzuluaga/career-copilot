# API Overview

## Metadata

| Property | Value |
|----------|-------|
| Product | Career Copilot |
| Category | Career Relationship Management (CRM) Platform |
| Document | API Overview |
| Version | 1.0.0 |
| Status | Draft |
| Owner | Dorian Zuluaga |
| Last Updated | 2026-07-18 |

---

# Purpose

This document provides a high-level overview of the backend API.

Its objective is to define the responsibilities of the API, the services it exposes, and how the frontend interacts with the business logic.

This document intentionally avoids implementation details and endpoint definitions.

---

# API Philosophy

The backend API acts as the single entry point to the Career Copilot platform.

Every client request is validated, processed, and coordinated through the API before interacting with external services or persistent storage.

The frontend never communicates directly with the database or AI providers.

---

# API Responsibilities

The API is responsible for:

- User authentication through Google OAuth.
- Authorization.
- Business logic.
- Database access.
- AI orchestration.
- PDF generation.
- Data validation.
- Error handling.

---

# Authentication Flow

```text
User
   │
   ▼
Frontend
   │
Google OAuth Login
   │
   ▼
Google Identity Provider
   │
Identity Token
   │
   ▼
Backend API
   │
Validate Token
   │
Find or Create User
   │
Create Application Session
   │
   ▼
Frontend
```



# Service Domains

The API is organized into functional domains.

## Authentication Service

Responsibilities:

- Authenticate users using Google OAuth.
- Validate the identity token provided by Google.
- Create a new user account on the first successful login.
- Retrieve existing user profiles.
- Establish the application's authenticated session.

The backend delegates user authentication to a trusted identity provider while remaining responsible for application-level authorization and user management.

---

## User Service

Responsibilities:

- Retrieve user profile
- Update user information
- Manage user preferences

---

## Master CV Service

Responsibilities:

- Create Master CV
- Update professional profile
- Retrieve CV information

---

## Job Analyzer Service

Responsibilities:

- Receive job descriptions
- Analyze requirements
- Extract relevant skills
- Identify ATS keywords

This service coordinates with the AI provider.

---

## CV Optimization Service

Responsibilities:

- Generate optimized CV versions
- Adapt content to specific job offers
- Prepare data for PDF generation

---

## Cover Letter Service

Responsibilities:

- Generate personalized cover letters
- Save generated versions
- Retrieve previous documents

---

## Application Service

Responsibilities:

- Create job applications
- Update application status
- Retrieve application history
- Manage notes

---

## Document Service

Responsibilities:

- Generate PDF documents
- Store generated files
- Retrieve downloadable documents

---

# Communication Flow

The API follows a request-response model.

```text
User
     │
     ▼
Frontend
     │
Google OAuth
     │
Identity Token
     ▼
Backend API
     │
Token Validation
     │
Authorization
     │
Business Logic
     │
 ┌───────┴────────┐
 ▼                ▼
Database      OpenAI API
     │
     ▼
Response
     │
     ▼
Frontend
```

Every request follows this lifecycle.

---

# Error Handling

The API returns consistent responses for:

- Successful operations
- Validation errors
- Authentication failures
- Authorization failures
- Resource not found
- Internal server errors

Error messages should be predictable and easy for the frontend to interpret.

---

# Security Principles

The API follows these principles:

- Validate every request.
- Never trust client input.
- Protect sensitive information.
- Restrict access using authentication.
- Keep API secrets on the server.

---

# Future Evolution

Future services may include:

- Interview Coach Service
- Career Analytics Service
- Recruiter Management Service
- Networking Service
- AI Career Advisor Service
- Notification Service

Each service should integrate with the existing API architecture without breaking current functionality.

---

# API Philosophy

The API is more than a collection of endpoints.

It is the orchestration layer that connects the user experience, business logic, artificial intelligence, and persistent data into a unified Career Relationship Management platform.

Every new feature should integrate through the API while preserving consistency, security, and maintainability.