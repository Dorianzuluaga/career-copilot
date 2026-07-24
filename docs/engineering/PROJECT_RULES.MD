# Project Rules

## Purpose

This document defines the mandatory rules that every developer and AI assistant must follow when working on Career Copilot.

These rules exist to ensure consistency, reduce ambiguity and protect previously validated product decisions.

Rules complement the project documentation and should always be interpreted together with:

- Product Documentation
- Architecture Documentation
- Feature Specifications
- AI Engineering Guide

If a rule conflicts with a documented product decision, the Product Documentation has priority.

---

# Rule 1 — Documentation First

Before implementing any feature, AI assistants must consult the project documentation.

Required reading order:

1. Product
2. Architecture
3. Engineering
4. Feature Specification

Implementation should never begin from assumptions.

---

# Rule 2 — Respect Approved Product Decisions

Product decisions that have already been validated must not be modified unless explicitly requested.

Examples:

- Google OAuth is the authentication method.
- Fast Apply is the MVP.
- Guided Apply is outside the MVP.
- Master CV is the Single Source of Truth.
- PDF generation requires user confirmation.

AI assistants must not propose alternative implementations that contradict these decisions.

---

# Rule 3 — Specification Before Implementation

Every significant feature should have a specification before implementation.

Implementation is not the place to discover requirements.

When requirements are incomplete, clarification should be requested.

---

# Rule 4 — Keep the Architecture Consistent

New code should follow the existing architecture.

Avoid introducing unnecessary patterns, frameworks or abstractions.

Whenever possible:

- Reuse existing components.
- Reuse existing services.
- Reuse existing utilities.
- Maintain separation of concerns.

Consistency is preferred over novelty.

---

# Rule 5 — AI Should Never Invent Requirements

If information is missing:

Stop.

Ask.

Do not assume.

Generating plausible but undocumented behavior is considered an error.

---

# Rule 6 — Product Before Technology

Technology decisions should always support product goals.

Do not introduce complexity that does not improve the MVP.

Prefer simple and maintainable solutions.

---

# Rule 7 — Minimize Context Loss

Whenever a new important decision is made, project documentation should be updated.

Future AI assistants should be able to understand the project without repeating previous conversations.

---

# Rule 8 — Improve the Knowledge Base

If AI repeatedly makes the same mistake, investigate the cause.

Possible causes include:

- Missing documentation.
- Missing context.
- Missing project rule.
- Missing specification.
- Missing reusable workflow.

Whenever possible, improve the documentation instead of repeating explanations.

---

# Rule 9 — Source of Truth

Every type of information has an owner.

Product → docs/product

Architecture → docs/architecture

Engineering → docs/engineering

Specifications → specs/

Source code should implement documented decisions.

Documentation defines expected behavior.

---

# Rule 10 — MVP First

Career Copilot follows an iterative development strategy.

During the MVP phase:

- Deliver the smallest functional solution.
- Avoid premature optimization.
- Avoid implementing future features.
- Prioritize completing the user workflow.

A working MVP is always preferred over an incomplete perfect architecture.

---

# Continuous Improvement

These rules are expected to evolve.

Whenever recurring problems appear during AI-assisted development, evaluate whether a new rule should be added.

Every new rule should solve a recurring problem rather than a single isolated situation.