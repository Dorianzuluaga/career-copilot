# Folder Structure

## Metadata

| Property | Value |
|----------|-------|
| Product | Career Copilot |
| Category | Career Relationship Management (CRM) Platform |
| Document | Folder Structure |
| Version | 1.0.0 |
| Status | Draft |
| Owner | Dorian Zuluaga |
| Last Updated | 2026-07-18 |

---

# Purpose

This document defines the directory structure of the Career Copilot repository.

The objective is to establish a clear organization that supports scalability, maintainability, and collaboration.

Every folder has a single responsibility.

---

# Repository Structure

```text
career-copilot/

├── .github/
├── apps/
│   ├── api/
│   └── web/
│
├── database/
│
├── docs/
│   ├── architecture/
│   ├── assets/
│   ├── decisions/
│   ├── product/
│   ├── prompts/
│   └── specs/
│
├── .gitignore
├── LICENSE
├── README.md
└── ROADMAP.md
```

---

# Root Directory

The root contains only project-level resources.

Examples:

- Documentation
- Repository configuration
- License
- Roadmap
- GitHub configuration

No application code should exist at the repository root.

---

# apps/

Contains all executable applications.

## web/

Frontend application.

Responsibilities:

- User Interface
- Components
- Pages
- Routing
- State Management
- API Communication
- PDF Rendering

---

## api/

Backend application.

Responsibilities:

- REST API
- Authentication
- Business Logic
- AI Integration
- Database Access
- PDF Generation

---

# database/

Contains everything related to persistent storage.

Examples:

- Schema
- Migrations
- Seed files
- SQL scripts
- Database documentation

---

# docs/

Contains all project documentation.

Documentation evolves independently from the code.

---

## architecture/

Software architecture.

Examples:

- System Overview
- Tech Stack
- High-Level Architecture
- Folder Structure
- Database Overview
- API Overview
- Security

---

## product/

Product documentation.

Examples:

- Product DNA
- Product Vision
- MVP Scope

---

## specs/

Functional specifications.

Examples:

- User Stories
- Feature Specifications
- Acceptance Criteria

---

## prompts/

Prompt engineering documentation.

Examples:

- AI prompts
- Prompt versions
- Prompt experiments

---

## decisions/

Reserved for future architectural decisions.

Examples:

- ADRs
- Design decisions
- Technology changes

---

## assets/

Static resources used in documentation.

Examples:

- Diagrams
- Images
- Icons
- Mockups

---

# Folder Responsibilities

Each folder owns one responsibility.

A folder should never become a mixture of unrelated resources.

Whenever possible:

- Documentation belongs in docs.
- Source code belongs in apps.
- Database resources belong in database.

---

# Growth Strategy

The repository should grow incrementally.

New folders should only be created when a clear responsibility emerges.

Avoid creating directories "just in case."

---

# Naming Conventions

Directories use:

- lowercase
- kebab-case
- descriptive names

Examples:

```
master-cv
cover-letter
application-tracker
job-analyzer
```

Avoid:

```
utils2
misc
new-folder
test-final
```

---

# Code Organization Philosophy

The repository is organized around responsibilities rather than technologies.

For example:

- Product documentation is separated from architecture.
- Backend is separated from frontend.
- Database is independent from the API.

This organization makes the project easier to understand and maintain as it grows.

---

# Future Evolution

As Career Copilot evolves, additional directories may be introduced.

Examples:

```
packages/
tests/
scripts/
infrastructure/
```

These folders should only be added when they serve a clear architectural purpose.

The repository should remain as simple as possible while supporting future scalability.