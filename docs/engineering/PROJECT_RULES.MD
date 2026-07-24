# Project Rules

## Purpose

This document defines the mandatory engineering rules that every developer and AI assistant must follow when working on Career Copilot.

These rules protect product consistency, architectural integrity, software quality, security and AI collaboration.

Rules complement the project documentation and should always be interpreted together with:

- Product Documentation
- Architecture Documentation
- Feature Specifications
- AI Engineering Guide

If a rule conflicts with a documented product decision, the Product Documentation has priority.

---

# Guiding Principles

These rules are intended to protect:

- Product consistency
- Software quality
- Architectural integrity
- Security
- AI collaboration
- Long-term maintainability

Every contributor, whether human or AI, is expected to follow these principles before introducing changes to the project.

---

# Rule 1 — Documentation First

Before implementing any feature, AI assistants must consult the project documentation.

Documentation must be read in the following order:

1. Product
2. Architecture
3. Engineering
4. Feature Specification
5. Existing Source Code

Implementation should never begin from assumptions.

---

# Rule 2 — Respect Approved Product Decisions

Previously approved product decisions must not be modified unless explicitly requested.

Examples include:

- Google OAuth is the authentication method.
- Fast Apply is the MVP.
- Guided Apply is outside the MVP.
- Master CV is the Single Source of Truth.
- PDF generation requires user confirmation.

AI assistants must not propose implementations that contradict approved product decisions.

---

# Rule 3 — Specification Before Implementation

Every significant feature should have a specification before implementation.

Implementation is not the place to discover requirements.

When requirements are incomplete:

Stop.

Ask.

Clarify.

Do not assume.

---

# Rule 4 — Keep the Architecture Consistent

New code should follow the existing architecture.

Avoid introducing unnecessary abstractions, frameworks or patterns.

Whenever possible:

- Reuse existing components.
- Reuse existing hooks.
- Reuse existing services.
- Reuse existing utilities.
- Maintain separation of concerns.

Consistency is preferred over novelty.

## Layer Separation

Each architectural layer has a single responsibility.

Frontend is responsible for presentation.

Backend is responsible for business logic.

Database is responsible for persistence.

AI providers are accessed only through the backend.

Responsibilities must never overlap.

## Reuse First

Before creating new code, verify whether an existing solution can be reused.

Avoid code duplication whenever possible.

## Simplicity First

Prefer the simplest implementation that satisfies the current requirement.

Do not introduce new libraries, abstractions or design patterns unless they provide clear long-term value.

---

# Rule 5 — AI Should Never Invent Requirements

If information is missing:

Stop.

Ask.

Do not assume.

Generating plausible but undocumented behavior is considered an engineering error.

---

# Rule 6 — Product Before Technology

Technology decisions should always support product goals.

Do not introduce complexity that does not improve the MVP.

Prefer simple, maintainable and understandable solutions.

Technology choices should never define the product.

Frameworks may change.

Product decisions should remain stable.

---

# Rule 7 — Minimize Context Loss

Whenever an important decision is made, project documentation should be updated.

Future AI assistants should understand the project without depending on previous conversations.

Persistent documentation is preferred over repeated prompts.

---

# Rule 8 — Improve the Knowledge Base

Whenever AI repeatedly produces incorrect results, investigate the cause before changing the implementation.

Possible causes include:

- Missing context.
- Missing documentation.
- Missing project rule.
- Missing specification.
- Missing reusable workflow.
- Missing reusable AI skill.

Whenever possible, improve the project's knowledge base instead of repeating explanations.

---

# Rule 9 — Source of Truth

Every type of information has a single owner.

| Knowledge | Source |
|------------|--------|
| Product Decisions | docs/product |
| Architecture Decisions | docs/architecture |
| Engineering Rules | docs/engineering |
| Feature Specifications | specs/ |
| Implementation | Source Code |

Documentation defines expected behavior.

Source code implements documented behavior.

---

# Rule 10 — MVP First

Career Copilot follows an iterative development strategy.

During the MVP phase:

- Deliver the smallest functional solution.
- Avoid premature optimization.
- Avoid implementing post-MVP features.
- Prioritize completing the full user workflow.

Working software is preferred over perfect architecture.

---

# Security Rules

## Secrets

- Never expose API keys.
- Never hardcode credentials.
- Never commit `.env` files.
- Never expose server secrets to the frontend.

## Environment Variables

- All secrets must be loaded from environment variables.
- Frontend should only access explicitly public environment variables.
- Private environment variables must remain server-side.

## OpenAI

- OpenAI API keys must only exist on the backend.
- Frontend must never communicate directly with OpenAI.
- Every AI request must go through the backend API.

## Authentication

- Authentication uses Google OAuth.
- JWT validation occurs on the backend.
- Protected endpoints require authentication.
- Authorization decisions must never rely solely on frontend logic.

## Validation

- Never trust user input.
- Validate every request.
- Sanitize AI inputs whenever appropriate.

## Logging

- Never log API keys.
- Never log authentication tokens.
- Never log sensitive personal information.

---

# Code Quality Rules

## TypeScript

- Avoid `any`.
- Prefer explicit types.
- Use strict mode.
- Remove unused code.

## React

- Components should remain small and focused.
- UI components should not contain business logic.
- Shared logic belongs in custom hooks or services.
- Prefer composition over inheritance.

## Backend

- Controllers remain lightweight.
- Business logic belongs in services.
- Data access remains isolated.
- Keep API responses consistent.

## Naming

- Use descriptive names.
- Avoid unnecessary abbreviations.
- Follow consistent naming conventions.

## Dependencies

Before installing a new dependency:

- Verify whether the functionality already exists.
- Prefer the current technology stack.
- Avoid unnecessary libraries.

## Refactoring

Refactoring should improve:

- Readability
- Maintainability
- Architecture

Avoid refactoring without a clear objective.

Do not mix refactoring with unrelated feature development.

## Testing

Every new feature should be testable.

Whenever possible:

- Validate new functionality.
- Verify bug fixes.
- Prevent regressions.

---

# AI Behavior Rules

AI assistants should:

- Explain architectural decisions before major implementations.
- Request clarification when requirements are ambiguous.
- Prefer consistency over creativity.
- Respect existing project conventions.
- Keep implementations aligned with documented architecture.

---

# AI Cost & Context Rules

Career Copilot treats AI context as an engineering resource.

The objective is not only to reduce AI costs, but to maximize the value obtained from every AI interaction.

## Context

- Load only the documentation required for the current task.
- Avoid repeating project context already available.
- Prefer document references over duplicated explanations.

## AI Requests

- Avoid duplicate AI calls.
- Reuse previous analysis whenever possible.
- Do not regenerate unchanged content.

## Prompt Design

- Prefer modular prompts.
- Prefer reusable context.
- Keep prompts focused on a single objective.

## Model Selection

- Use the smallest capable model.
- Escalate to larger models only when necessary.

## PDF Generation

- Generate PDFs only after user confirmation.
- Avoid regenerating identical documents.

---

# Decision Ownership

Every important project decision has a single owner.

Product Decisions

→ docs/product

Architecture Decisions

→ docs/architecture

Engineering Rules

→ docs/engineering

Feature Specifications

→ specs/

Implementation

→ Source Code

Avoid duplicating the same information across multiple documents.

---

# Continuous Improvement

These rules are expected to evolve alongside the project.

Whenever recurring problems appear during AI-assisted development, evaluate whether the issue originated from:

1. Missing context
2. Missing documentation
3. Missing project rule
4. Missing specification
5. Missing reusable AI skill
6. Implementation error

Whenever possible, improve the project's permanent knowledge rather than relying on increasingly complex prompts.

The goal is to continuously improve both the software and the AI engineering process.