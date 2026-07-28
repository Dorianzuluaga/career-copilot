# Career Copilot

> An AI-powered Career Relationship Management (CRM) platform that helps job seekers manage their job search, optimize their CV, generate personalized cover letters, and track applications from a single place.

---

## Project Overview

Career Copilot is a Full Stack web application designed to simplify and improve the job search process.

Instead of manually adapting CVs, writing cover letters, and tracking applications across spreadsheets, Career Copilot centralizes the entire workflow and uses Artificial Intelligence to help users apply more efficiently.

This project is being developed following a **documentation-first** approach, where product decisions and architecture are defined before implementation.

---

## Current Status

The technical bootstrap is complete. The repository contains the React frontend,
Express API, PostgreSQL-ready Prisma configuration, and shared development
tooling required to begin feature development. Product features have not been
implemented yet.

---

## MVP Features

- Google OAuth authentication
- Master CV management
- AI-powered job description analysis
- AI CV optimization
- AI cover letter generation
- Job application tracking
- PDF document generation (react-pdf, pdf-lib, jsPDF)

---

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Context API + Custom Hooks

### Backend

- Node.js 22
- Express
- TypeScript

### Database

- PostgreSQL
- Prisma

### AI Development

- ChatGPT (Architecture, Documentation & Code Review)
- Spec Kit (Feature Specifications & AI Context Management)
- Cursor (Feature Development)
- Claude Code (Feature Development)
- Codex (Refactoring, Testing & Security)

### AI Integration

- OpenAI API

### Authentication

- Google OAuth

### Deployment

- Vercel (Frontend)
- Railway (Backend)

### Testing

- Vitest

---

## Project Structure

```text
career-copilot/

├── apps/
│   ├── api/
│   └── web/
│
├── database/
│
├── docs/
│   ├── architecture/
│   ├── product/
│   ├── prompts/
│   └── specs/
│
├── README.md
├── ROADMAP.md
└── LICENSE
```

---

## Architecture

Career Copilot follows a modular architecture composed of:

- React Frontend
- Express Backend API
- PostgreSQL Database
- OpenAI Services
- Google OAuth Authentication

The architecture is designed to keep business logic, AI services, and data management clearly separated.

---

## Documentation

Project documentation is organized under the `docs/` directory.

- Product documentation
- Architecture documentation
- AI prompts
- Feature specifications

---

## Roadmap

The development roadmap is available in:

```text
ROADMAP.md
```

---

## Getting Started

### Prerequisites

- Node.js 22 LTS
- npm
- PostgreSQL when database-backed features are introduced

### Installation

Clone the repository and install the workspace dependencies:

```bash
git clone <https://github.com/Dorianzuluaga/career-copilot>
cd career-copilot
npm install
```

Create local environment files from the committed templates:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

OpenAI configuration belongs only in `apps/api/.env`. Do not add OpenAI
credentials to `apps/web/.env`.

Master CV extraction uses:

- `OPENAI_API_KEY` — required; a server-side OpenAI API key.
- `OPENAI_MODEL` — optional; defaults to `gpt-4.1-mini`.

The API validates `OPENAI_API_KEY` during startup and stops with a clear error
when it is missing or empty. The committed `.env.example` contains placeholders
only; real credentials must remain in the ignored `apps/api/.env` file.

Replace the placeholder `DATABASE_URL` before using database commands. Load it
into the current shell and generate the Prisma Client:

```bash
set -a
source apps/api/.env
set +a
npm exec --workspace apps/api -- prisma generate
```

### Development

Run the frontend and backend in separate terminals:

```bash
npm run dev --workspace apps/web
```

```bash
npm run dev --workspace apps/api
```

The frontend runs at `http://localhost:5173`. The API runs at
`http://localhost:3001`, with its health check available at
`http://localhost:3001/health`.

### Verification

Run the complete workspace verification suite from the repository root:

```bash
npm run build
npm run lint
npm run typecheck
npm run test
```

---

## License

This project is licensed under the MIT License.
