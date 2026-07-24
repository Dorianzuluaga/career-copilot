# AI Engineering Guide

## Purpose

This document defines how AI assistants should work within the Career Copilot project.

Career Copilot follows an **AI-First Engineering** approach, where documentation is treated as the primary source of context for both developers and AI assistants.

The objective is to minimize ambiguity, reduce repeated explanations, and ensure that every AI interaction produces consistent, predictable and maintainable results.

---

# AI-First Philosophy

Artificial Intelligence is considered a development collaborator rather than a code generator.

Every implementation should be driven by documented knowledge instead of assumptions.

AI assistants must understand the project before proposing or implementing changes.

When information is missing, the AI should request clarification instead of inventing requirements.

---

# Project Knowledge Base

The project documentation acts as the permanent knowledge base.

Instead of relying on conversation history, AI assistants must retrieve project context from the repository documentation.

The documentation should always be considered the source of truth.

Current knowledge base:

docs/

├── product/
│   ├── 01-product-dna.md
│   ├── 02-product-vision.md
│   ├── 03-mvp-scope.md
│   ├── 04-application-workflow.md
│   └── 05-user-flow.md
│
├── architecture/
│   ├── 01-system-overview.md
│   ├── 02-tech-stack.md
│   ├── 03-high-level-architecture.md
│   ├── 04-folder-structure.md
│   ├── 05-database-overview.md
│   ├── 06-api-overview.md
│   └── 07-security.md
│
└── engineering/
    ├── AI_ENGINEERING.md
    ├── PROJECT_RULES.md
    └── DEVELOPMENT_GUIDE.md

---

# Documentation Priority

When implementing any feature, documentation should be consulted in the following order:

1. Product Documentation
2. Architecture Documentation
3. Project Rules
4. Feature Specification
5. Existing Source Code

If any conflict exists, the highest document in the hierarchy has priority.

Product decisions always take precedence over implementation details.

---

# Development Methodology

Career Copilot follows a Spec-Driven Development workflow.

Features should never begin with implementation.

The expected process is:

Idea

↓

Specification

↓

Validation

↓

Implementation

↓

Testing

↓

Documentation Update

Implementation is the consequence of an approved specification, not the starting point.

---

# AI Responsibilities

Before implementing a feature, AI assistants should:

- Understand the product objective.
- Read the relevant project documentation.
- Respect existing architectural decisions.
- Avoid modifying previously approved product decisions.
- Ask for clarification when requirements are incomplete.
- Produce maintainable and well-structured code.
- Update documentation whenever architecture or behavior changes.

---

# Context Before Code

AI should prioritize understanding before generating code.

Whenever code generation produces poor results, the cause should be investigated in this order:

1. Missing project context.
2. Missing documentation.
3. Missing project rule.
4. Missing feature specification.
5. Missing reusable AI skill.
6. Implementation error.

Poor AI output should never be assumed to be exclusively an AI limitation.

---

# Source of Truth

Career Copilot maintains a single source of truth for every knowledge domain.

Product decisions belong in Product documentation.

Architecture belongs in Architecture documentation.

Development standards belong in Engineering documentation.

Source code should reflect documentation—not replace it.

---

# Continuous Improvement

Every time an AI assistant produces an incorrect, inconsistent or unexpected result, the team should evaluate whether the problem originated from:

- Missing context.
- Missing documentation.
- Missing rule.
- Missing specification.
- Missing reusable workflow.

Whenever possible, improvements should be incorporated into the project knowledge base so future AI interactions become more reliable.

The objective is not only to improve the software, but also to continuously improve the project's AI memory.