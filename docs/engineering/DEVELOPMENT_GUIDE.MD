# Development Guide

## Purpose

This guide defines the standard development workflow for Career Copilot.

Its objective is to ensure that every feature is planned, documented, implemented and validated consistently by both human developers and AI assistants.

Development should always follow a structured process instead of relying on assumptions or improvisation.

---

# Development Philosophy

Career Copilot follows an AI-First and Specification-Driven Development approach.

Every implementation should follow this mindset:

Think First

↓

Document Second

↓

Implement Third

↓

Validate Fourth

↓

Improve Continuously

The goal is to make development predictable, maintainable and easy to understand.

---

# The Development Pyramid

Implementation is the result of a series of validated decisions.

Development should always respect the following hierarchy:

```
                Product Vision
                     ▲
          Product Documentation
                     ▲
          Feature Specification
                     ▲
       Architecture & Project Rules
                     ▲
             Implementation
                     ▲
               Validation
```

Code is the consequence of decisions, not the starting point.

---

# Standard Development Workflow

Every new feature follows the same lifecycle.

```
Idea

↓

Backlog

↓

Issue

↓

Feature Specification

↓

Documentation Review

↓

Implementation

↓

Validation

↓

Documentation Update

↓

Done
```

Skipping steps usually introduces ambiguity, technical debt or inconsistent implementations.

---

# Feature Development Checklist

## Before Development

Before writing code, verify that:

- The feature has a clear objective.
- A GitHub Issue exists.
- A Feature Specification exists (when applicable).
- Product Documentation has been reviewed.
- Architecture Documentation has been reviewed.
- AI Engineering documentation has been reviewed.
- Project Rules have been reviewed.
- Existing source code has been inspected for reusable solutions.

If any required information is missing:

Stop.

Ask.

Clarify.

Do not assume.

---

## During Development

While implementing a feature:

- Follow the existing architecture.
- Reuse existing components whenever possible.
- Reuse existing hooks, services and utilities.
- Keep changes focused on a single objective.
- Write readable and maintainable code.
- Prefer simple implementations over complex abstractions.
- Keep business logic separated from presentation logic.

Development should improve consistency instead of introducing unnecessary complexity.

---

# Dependency Management

Before installing a new dependency:

- Verify whether the functionality already exists in the project.
- Prefer the current technology stack whenever possible.
- Evaluate the maintenance cost of the dependency.
- Avoid introducing libraries for small or isolated problems.
- Every new dependency should provide clear long-term value.

A smaller and more consistent dependency tree is easier to maintain.

---

# Refactoring Guidelines

Refactoring should always have a clear purpose.

Acceptable reasons include:

- Improve readability.
- Improve maintainability.
- Reduce duplication.
- Improve architecture.
- Simplify existing code.

Avoid refactoring unrelated code while implementing a feature.

Keep feature development and refactoring independent whenever possible.

---

# AI Development Workflow

When AI assistants work on a task, they should follow this process:

```
Receive Task

↓

Read Product Documentation

↓

Read Architecture Documentation

↓

Read AI Engineering Guide

↓

Read Project Rules

↓

Read Feature Specification

↓

Inspect Existing Source Code

↓

Implement

↓

Validate

↓

Update Documentation (if necessary)
```

AI should always understand the project before generating code.

---

# Decision Flow

Whenever information is missing, follow this decision process.

```
Missing Information?

↓

YES

↓

Ask for clarification

↓

Update documentation if needed

↓

Continue implementation

NO

↓

Implement
```

Never replace missing requirements with assumptions.

---

# Testing Guidelines

Testing validates that the implementation satisfies the intended behavior.

Every completed feature should be verifiable.

Whenever possible:

- Validate the expected user workflow.
- Verify that previous functionality still works.
- Confirm that architecture has not been broken.
- Ensure the implementation respects Product Documentation.
- Ensure Project Rules are still satisfied.

Testing should focus on confidence rather than quantity.

---

# Definition of Done

A feature is considered complete only when:

- Requirements have been satisfied.
- Product decisions remain unchanged.
- Architecture has been respected.
- Code follows project conventions.
- Validation has been completed.
- Documentation has been updated if necessary.
- The feature is ready for the MVP.

A feature is not finished simply because the code compiles.

---

# Continuous Improvement

Development is an iterative process.

Whenever repetitive problems appear, evaluate whether the solution should improve:

- Product Documentation
- Architecture Documentation
- AI Engineering Guide
- Project Rules
- Feature Specifications
- Reusable AI prompts
- Reusable AI workflows

Whenever possible, improve the system instead of solving the same problem repeatedly.

The objective is to continuously improve both the software and the development process.

## Prisma Studio

Always launch Prisma Studio from the API workspace to ensure the correct Prisma configuration and environment variables are loaded.

```bash
npm exec --workspace=api -- prisma studio
```
