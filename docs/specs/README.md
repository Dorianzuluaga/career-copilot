# Specifications

## Purpose

This directory contains the functional specifications for Career Copilot.

Specifications describe **what the system should do** before implementation begins.

They provide a shared understanding between product, architecture, development and AI assistants.

Specifications are the bridge between project documentation and source code.

---

# Why Specifications Exist

Specifications reduce ambiguity.

Instead of discovering requirements during implementation, developers and AI assistants should implement previously validated behavior.

Every significant feature should begin with a specification.

---

# Specification-Driven Development

Career Copilot follows a Specification-Driven Development methodology.

The development lifecycle is:

```
Idea

↓

Product Decision

↓

Feature Specification

↓

Implementation

↓

Validation

↓

Documentation Update
```

Implementation should never become the place where requirements are defined.

---

# What a Specification Defines

A specification describes:

- The purpose of the feature.
- The user workflow.
- Functional requirements.
- Acceptance criteria.
- Technical considerations.
- What is explicitly outside the scope.

Specifications describe expected behavior.

They do not describe implementation details.

---

# Relationship with Other Documentation

Specifications work together with the rest of the project documentation.

Product Documentation

→ Defines the product vision.

Architecture Documentation

→ Defines how the system is organized.

Project Rules

→ Define engineering constraints.

Development Guide

→ Defines the development workflow.

Specifications

→ Define the behavior of individual features.

Source Code

→ Implements the specification.

---

# When to Create a Specification

Create a specification when:

- A new feature is introduced.
- Existing behavior changes significantly.
- Multiple implementation approaches are possible.
- AI assistants need stable requirements.

Small bug fixes usually do not require a dedicated specification.

---

# Writing Principles

Good specifications should be:

- Clear.
- Concise.
- Unambiguous.
- Focused on user behavior.
- Independent from implementation details.

Avoid:

- Source code.
- Prompt engineering.
- Framework-specific decisions.
- Low-level implementation details.

Those belong elsewhere.

---

# File Organization

Each specification should represent one feature.

Example:

```
specs/

feature-template.md

fast-apply.md

master-cv.md

application-workspace.md

cover-letter.md
```

Avoid combining multiple independent features into a single specification.

---

# Relationship with Prompts

Specifications define the expected behavior.

Prompts implement that behavior.

If a prompt conflicts with a specification, the specification always has priority.

Specifications are part of the project's source of truth.

---

# Continuous Evolution

Specifications are living documents.

Whenever the product evolves, specifications should evolve together with it.

A specification should remain the best description of the intended feature throughout its lifecycle.