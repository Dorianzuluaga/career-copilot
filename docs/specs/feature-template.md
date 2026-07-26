# Feature Specification Template

## Feature Information

**Feature Name**

> Name of the feature.

**Status**

- Draft
- Approved
- In Development
- Completed

**Priority**

- High
- Medium
- Low

---

# Purpose

Describe why this feature exists.

Answer the following questions:

- What problem does it solve?
- Why is it valuable?
- What is the expected outcome?

---

# Dependencies

List the required features or systems that must exist before implementing this feature.

Examples:

- Authentication
- Master CV
- Job Analysis
- None

---

# Context Required

List only the documentation required to implement this feature.

Examples:

- Product Vision
- Product Workflow
- AI Engineering Guide
- Project Rules
- Related Specification

Load only the documentation required for this feature.

---

# User Workflow

Describe the complete user journey.

Example:

1. User opens the feature.
2. User provides the required information.
3. The system processes the request.
4. Results are displayed.
5. User confirms or continues.

Describe user behavior, not technical implementation.

---

# Functional Requirements

Describe the expected system behavior.

Each requirement should describe a single responsibility.

Examples:

- The user can...
- The system should...
- The application must...

---

# Business Rules

Describe the rules that the system must always respect.

Examples:

- Required fields.
- Validation rules.
- Unique identifiers.
- Permissions.
- Confirmation dialogs.
- Data persistence.

Business rules must never be ambiguous.

---

# UI Requirements

Describe the expected user interface.

For each screen specify:

- Main sections
- Buttons
- Forms
- Navigation
- Empty states
- Placeholder content (if applicable)

Describe only visible behavior, not implementation details.

---

# Acceptance Criteria

Describe observable and testable behavior using the Given / When / Then format.

Example:

Given ...

When ...

Then ...

Every functional requirement should have at least one acceptance criterion.

---

# Technical Notes

Document only implementation constraints that influence development.

Examples:

- Reuse an existing component.
- Reuse an existing service.
- Requires authentication.
- Uses React Context.
- Uses an external integration.

Avoid unnecessary implementation details.

---

# AI Considerations

Describe AI-specific requirements only if applicable.

Examples:

- AI interaction required.
- Expected input.
- Expected output.
- Context requirements.
- Validation rules.
- Token optimization.

If AI is not involved:

> Not applicable.

---

# Out of Scope

Clearly define what this feature does **not** include.

Examples:

- Future improvements.
- Nice-to-have functionality.
- Post-MVP ideas.

This section exists to prevent scope creep.

---

# Related Documentation

Reference only the documentation directly related to this feature.

Examples:

- Product Documentation
- Architecture Documentation
- AI Engineering Guide
- Project Rules
- Related Specifications

Avoid unnecessary references.

---

# Spec Validation Checklist

- [ ] User workflow completely defined.
- [ ] Navigation between screens defined.
- [ ] CRUD interactions defined (if applicable).
- [ ] Business rules defined.
- [ ] UI requirements defined.
- [ ] UI placeholders defined (if applicable).
- [ ] Acceptance criteria defined.
- [ ] Out of scope defined.
- [ ] No ambiguous requirements.
