# Prompts

## Purpose

This directory contains reusable AI prompts used by Career Copilot.

Prompts are considered part of the application's implementation rather than project documentation.

Their purpose is to provide consistent AI behavior across different features while minimizing duplicated prompt engineering.

---

# Guiding Principles

Every prompt should:

- Solve a single objective.
- Be reusable.
- Be easy to maintain.
- Avoid duplicated instructions.
- Respect the project's Product Documentation.
- Respect the AI Engineering Guide.
- Respect the Project Rules.

Prompts should never redefine business requirements.

Business decisions belong in the project documentation.

---

# Prompt Organization

Each prompt should represent a single responsibility.

Examples:

```
prompts/

cv-optimization.md

cover-letter.md

job-analysis.md

skill-extraction.md

professional-summary.md
```

Avoid combining multiple responsibilities into a single prompt.

---

# Prompt Design Guidelines

Every prompt should include:

- Objective
- Context
- Instructions
- Expected Output

Whenever possible:

- Keep prompts modular.
- Reuse common context.
- Avoid unnecessary verbosity.
- Minimize token usage.

---

# Prompt Lifecycle

A prompt follows the same lifecycle as any other project asset.

Idea

↓

Feature Specification

↓

Prompt Design

↓

Implementation

↓

Testing

↓

Iteration

Prompts should evolve together with the product.

---

# Relationship with Specifications

Prompts implement documented behavior.

Specifications define expected behavior.

If a prompt and a specification conflict, the specification has priority.

Prompts should never become the source of truth.