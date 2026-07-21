# Career Copilot

> An AI-powered Career Relationship Management (CRM) platform that helps job seekers manage their job search, optimize their CV, generate personalized cover letters, and track applications from a single place.

---

## Project Overview

Career Copilot is a Full Stack web application designed to simplify and improve the job search process.

Instead of manually adapting CVs, writing cover letters, and tracking applications across spreadsheets, Career Copilot centralizes the entire workflow and uses Artificial Intelligence to help users apply more efficiently.

This project is being developed following a **documentation-first** approach, where product decisions and architecture are defined before implementation.

---

## MVP Features

* Google OAuth authentication
* Master CV management
* AI-powered job description analysis
* AI CV optimization
* AI cover letter generation
* Job application tracking
* PDF document generation (react-pdf, pdf-lib, jsPDF)

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* React Router
* Context API + Custom Hooks

### Backend

* Node.js
* Express

### Database

* PostgreSQL

### AI Development

- ChatGPT (Architecture, Documentation & Code Review)
- Spec Kit (Feature Specifications & AI Context Management)
- Cursor (Feature Development)
- Claude Code (Feature Development)
- Codex (Refactoring, Testing & Security)

### AI Integration

- OpenAI API

### Authentication

* Google OAuth

### Deployment

* Vercel (Frontend)
* Railway (Backend)

### Testing

* Vitest

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

* React Frontend
* Express Backend API
* PostgreSQL Database
* OpenAI Services
* Google OAuth Authentication

The architecture is designed to keep business logic, AI services, and data management clearly separated.

---

## Documentation

Project documentation is organized under the `docs/` directory.

* Product documentation
* Architecture documentation
* AI prompts
* Feature specifications *(planned)*

---

## Roadmap

The development roadmap is available in:

```text
ROADMAP.md
```

---

## Getting Started

Clone the repository:

```bash
git clone <https://github.com/Dorianzuluaga/career-copilot>
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

## License

This project is licensed under the MIT License.
