# Feature Specification

## Feature Information

**Feature Name**

Google Authentication

**Status**

Approved

**Priority**

P0 (MVP)

---

# Purpose

Allow users to securely authenticate using their Google account before accessing Career Copilot.

Authentication is delegated to Google while application authorization and session management remain the responsibility of the backend.

Expected outcome:

- Users can authenticate using Google.
- The backend establishes an authenticated application session.
- Authenticated users are redirected to the Dashboard.

---

# Dependencies

- API Overview
- Security Overview

---

# Context Required

Load only:

- Product Vision
- Product Workflow
- API Overview
- Security Overview
- AI Engineering Guide
- Project Rules

---

# User Workflow

1. User opens Career Copilot.
2. User is redirected to `/login`.
3. Login screen is displayed.
4. User clicks **Continue with Google**.
5. Google Authentication flow opens.
6. User selects a Google account.
7. Google returns a valid Identity Token.
8. Frontend sends the Identity Token to the backend.
9. Backend validates the Identity Token.
10. Backend finds or creates the user.
11. Backend creates the application session.
12. Backend returns the authenticated user.
13. Frontend redirects the user to the Dashboard.

If authentication fails:

- User remains on the Login screen.
- A friendly error message is displayed.

---

# Functional Requirements

- Display a Login screen.
- Display a Continue with Google button.
- Authenticate users using Firebase Authentication.
- Obtain the Google Identity Token.
- Send the Identity Token to the backend.
- Validate the Identity Token.
- Create a new user if one does not already exist.
- Reuse existing users.
- Create an authenticated application session.
- Restore authenticated sessions.
- Redirect authenticated users to the Dashboard.
- Display friendly authentication errors.

---

# Business Rules

- Google is the only authentication provider.
- Firebase Authentication is used by the frontend.
- Firebase Admin SDK validates Identity Tokens.
- Passwords are never managed by Career Copilot.
- Authentication is delegated to Google.
- Authorization belongs to the backend.
- Users are uniquely identified by Google's immutable `sub`.
- Existing users must never be duplicated.
- Session persistence is handled by the backend.
- This feature establishes authentication only.
- Route protection will be implemented by the Protected Routes feature.

---

# UI Requirements

## Login Screen

### Sections

- Career Copilot text logo
- Welcome message
- Continue with Google button

### Buttons

- Continue with Google

### Navigation

Successful authentication

→ Dashboard

Authentication failure

→ Stay on Login

### Empty States

Not applicable.

### Placeholder Content

Not applicable.

---

# Navigation

| Route      | Behaviour                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| /          | Redirect to `/login` if no authenticated session exists. Redirect to `/dashboard` if an authenticated session exists. |
| /login     | Display Login screen.                                                                                                 |
| /dashboard | Destination after successful authentication. Route protection is implemented in a future feature.                     |

---

# API Contract

## POST /api/auth/google

### Request

```json
{
  "idToken": "<google_identity_token>"
}
```

### Success Response

```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@email.com",
    "avatar": "https://..."
  }
}
```

---

### Authentication Failure

HTTP 401

```json
{
  "authenticated": false,
  "message": "Authentication failed."
}
```

---

### Server Error

HTTP 500

```json
{
  "message": "Internal server error."
}
```

---

## GET /api/auth/me

Returns the authenticated user associated with the current application session.

If no authenticated session exists:

HTTP 401

---

# User Model

Required fields

- id (UUID v4)
- googleSub
- email
- name

Optional fields

- avatar

Generated fields

- createdAt
- updatedAt

---

# Database Changes

This feature introduces the initial User model.

A database migration must be created.

---

# Implementation Decisions

## Frontend Authentication

- Firebase Authentication
- Google Authentication Provider
- Firebase configuration loaded from environment variables

---

## Backend Authentication

- Firebase Admin SDK validates Identity Tokens.
- Backend finds or creates the user.
- Backend establishes the authenticated application session.

---

## Session Management

Application sessions are managed by the backend.

Cookie name

```
career_copilot_session
```

Cookie properties

- HTTP Only
- SameSite=Lax
- Secure in production
- Non-secure during local development
- Max Age: 7 days

The cookie contains only the application session identifier.

Authentication tokens are never stored in the frontend.

---

## Local Development

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3001
```

Backend must allow CORS only for:

```
http://localhost:5173
```

---

# Acceptance Criteria

### AC1

Given the user navigates to `/login`

When the page loads

Then the Login screen is displayed.

---

### AC2

Given the Login screen

When the user clicks Continue with Google

Then the Google Authentication flow starts.

---

### AC3

Given successful Google Authentication

When the frontend receives the Identity Token

Then it sends the token to the backend.

---

### AC4

Given a valid Identity Token

When the backend validates it

Then the user becomes authenticated.

---

### AC5

Given a first-time user

When authentication succeeds

Then the backend creates a new user.

---

### AC6

Given an existing user

When authentication succeeds

Then the existing user is reused.

---

### AC7

Given successful authentication

When the backend creates the application session

Then the frontend redirects the user to `/dashboard`.

---

### AC8

Given an authenticated session

When the application reloads

Then the frontend restores the authenticated user using `GET /api/auth/me`.

---

### AC9

Given authentication fails

When the authentication flow finishes

Then the Login screen remains visible and a friendly error message is displayed.

---

# Technical Notes

- Follow API Overview.
- Follow Security Overview.
- Reuse the current architecture.
- Create the initial User database model.
- Create the corresponding migration.
- Do not implement Logout.
- Do not implement Protected Routes.
- Do not implement User Profile editing.

---

# AI Considerations

Not applicable.

---

# Out of Scope

- Logout
- Protected Routes
- User Profile editing
- Session expiration
- Refresh Tokens
- Multi-factor authentication
- RBAC
- Additional authentication providers

---

# Related Documentation

- Product Vision
- Product Workflow
- API Overview
- Security Overview
- AI Engineering Guide
- Project Rules

---

# Spec Validation Checklist

- [x] User workflow completely defined.
- [x] Navigation between screens defined.
- [x] Business rules defined.
- [x] UI requirements defined.
- [x] API contracts defined.
- [x] User model defined.
- [x] Database changes defined.
- [x] Implementation decisions defined.
- [x] Acceptance criteria defined.
- [x] Out of scope defined.
- [x] No ambiguous requirements.
