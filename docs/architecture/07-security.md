# Security Overview

## Metadata

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Product      | Career Copilot                                |
| Category     | Career Relationship Management (CRM) Platform |
| Document     | Security Overview                             |
| Version      | 1.0.0                                         |
| Status       | Draft                                         |
| Owner        | Dorian Zuluaga                                |
| Last Updated | 2026-07-18                                    |

---

# Purpose

This document defines the security principles adopted by the Career Copilot MVP.

The objective is to establish a secure foundation that protects user data, application integrity, and external services while keeping the implementation appropriate for an MVP.

This document focuses on architectural principles rather than implementation details.

---

# Security Philosophy

Security is considered a fundamental part of the system architecture.

Every layer of the application contributes to protecting user information and ensuring that only authorized operations are performed.

The MVP prioritizes practical and maintainable security measures without introducing unnecessary complexity.

---

# Security Principles

The platform follows these principles:

- Authentication before access.
- Authorization before action.
- Validate every request.
- Never trust client input.
- Least privilege.
- Secure by default.

---

# Authentication

Career Copilot uses Google OAuth as the authentication provider for the MVP.

Authentication is delegated to Google's identity platform, allowing the application to rely on a secure and widely adopted authentication system.

The backend remains responsible for:

- Validating the identity token.
- Creating user records when necessary.
- Managing application authorization.
- Protecting access to user resources.

---

# Authorization

Authentication identifies the user.

Authorization determines what the user is allowed to access.

Every request involving private information must verify ownership before returning or modifying data.

Users can only access their own resources.

---

# Data Protection

The platform stores personal and professional information.

Examples include:

- User profile
- Master CV
- Job applications
- AI-generated documents
- Personal notes

Sensitive information must remain protected throughout its lifecycle.

---

# Password Security

The MVP does not store or manage user passwords.

Password creation, storage, recovery, and verification are handled entirely by the external authentication provider.

This approach reduces security risks and allows the development team to focus on the platform's core functionality.

---

# API Security

The backend API is responsible for:

- Validating identity tokens received from the authentication provider.
- Verifying user authorization.
- Validating all incoming requests.
- Sanitizing user input.
- Protecting business logic.
- Returning secure and consistent responses.

The frontend never communicates directly with the database, AI providers, or authentication secrets.

---

# AI Security

Artificial Intelligence services are accessed only through the backend.

API keys:

- Are never exposed to the frontend.
- Are stored as environment variables.
- Are never committed to version control.

AI responses should always be validated before becoming persistent user data.

---

# Environment Variables

Sensitive configuration values must remain outside the source code.

Examples of **SERVER-ONLY / SECRET** values:

- Firebase Admin service account (`GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT`)
- Database credentials (`DATABASE_URL`)
- OpenAI API key (`OPENAI_API_KEY`)

Examples of **PUBLIC / CLIENT-SAFE** values:

- Frontend API origin (`VITE_API_URL`)
- Firebase web app config (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`)

Frontend variables must only contain values that are safe to expose in the browser.

Environment files must never be committed to version control.

Production hosting setup, required variables, and the deployment checklist are documented in `docs/engineering/DEPLOYMENT.md`.

---

# File Security

Generated documents should only be accessible to their owner.

Uploaded files must be validated before processing.

Future versions may include antivirus scanning and secure object storage.

---

# Error Handling

The application should never expose:

- Internal server details
- Stack traces
- Database information
- Secret configuration values

Error responses should be informative for users while remaining safe for the system.

---

# Logging

Application logs should help diagnose issues without exposing sensitive information.

Logs must never include:

- Passwords
- Authentication tokens
- API keys
- Personal confidential information

---

# Future Security Enhancements

Potential future improvements include:

- Multi-factor authentication (MFA)
- Rate limiting
- Audit logs
- Refresh tokens
- Account recovery workflows
- Email verification
- Session management
- Role-based access control (RBAC)

These features are intentionally postponed until they provide clear value beyond the MVP.

---

# Security Philosophy

Security is an ongoing process rather than a single implementation task.

Career Copilot aims to establish a secure foundation that can evolve alongside the platform while maintaining simplicity, reliability, and user trust.
