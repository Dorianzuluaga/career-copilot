# Bootstrap Project

## Status

Draft

---

## Goal

Initialize the Career Copilot project with the minimum technical foundation required to begin feature development.

This task does not implement business functionality.

---

## Scope

The bootstrap must create and configure:

- Frontend application
- Backend application
- Shared project structure
- Development environment
- Basic tooling

---

## Functional Requirements

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Vitest

The application must start successfully.

---

### Backend

- Express
- TypeScript

The API must expose a health endpoint.

Example:

GET /health

Response:

200 OK

```json
{
  "status": "ok"
}
```

---

### Database

Prepare the project for PostgreSQL.

Configure Prisma without creating business models.

---

### Project Structure

Initialize:

apps/web

apps/api

database

---

### Environment

Create `.env.example` files.

Do not include secrets.

---

### Out of Scope

This task must NOT include:

- Authentication
- Google OAuth
- JWT
- OpenAI
- PDF generation
- Business logic
- Database models
- Application features

---

## Acceptance Criteria

- Frontend starts successfully.
- Backend starts successfully.
- Health endpoint returns 200.
- Prisma is configured.
- Project structure matches the architecture documentation.
- No business functionality exists.