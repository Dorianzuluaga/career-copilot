# Database Overview

## Metadata

| Property | Value |
|----------|-------|
| Product | Career Copilot |
| Category | Career Relationship Management (CRM) Platform |
| Document | Database Overview |
| Version | 1.0.0 |
| Status | Draft |
| Owner | Dorian Zuluaga |
| Last Updated | 2026-07-18 |

---

# Purpose

This document provides a conceptual overview of the data model used by Career Copilot.

Its objective is to identify the core business entities, describe their relationships, and define the information that must persist across the platform.

This document is technology-agnostic and intentionally avoids SQL implementation details.

---

# Database Philosophy

Career Copilot manages relationships rather than isolated records.

The database has been designed around the user's career journey, allowing every application, document, and interaction to remain connected.

The model prioritizes consistency, traceability, and future scalability.

---

# Core Entities

The MVP is built around the following business entities.

## User

Represents a registered platform user.

Stores:

- Personal information
- Authentication data
- Preferences
- Account settings

---

## Master CV

Represents the user's primary professional profile.

Stores:

- Personal summary
- Skills
- Work experience
- Education
- Certifications
- Languages
- Projects

Each user owns one Master CV.

---

## Job Application

Represents a single application submitted by the user.

Stores:

- Application date
- Status
- Notes
- Related company
- Related job offer
- Generated documents

A user may have multiple job applications.

---

## Company

Represents an employer.

Stores:

- Company name
- Industry
- Website
- Location
- Recruiter information (future)

A company may receive multiple applications over time.

---

## Job Offer

Represents the original job description.

Stores:

- Job title
- Description
- Requirements
- Responsibilities
- Skills extracted by AI
- Source URL

Every application references one job offer.

---

## Cover Letter

Represents an AI-generated or manually edited cover letter.

Stores:

- Generated content
- Edited version
- Generation date
- Version history (future)

Each application may contain one or more cover letters.

---

## Generated Document

Represents exported files.

Examples:

- Optimized CV
- Cover Letter PDF
- Future reports

---

## Note

Represents personal notes associated with an application.

Examples:

- Interview reminders
- Salary expectations
- Recruiter comments

---

# Entity Relationships

The conceptual relationships are:

```text
User
 │
 ├────────────── Master CV
 │
 └────────────── Job Applications
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
     Company     Job Offer   Cover Letter
          │                     │
          └──────────────┐      │
                         ▼      ▼
                 Generated Documents
                         │
                         ▼
                       Notes
```

---

# Data Ownership

Every business object belongs to a user.

Users never share information.

The MVP follows a single-user ownership model.

Future collaborative features may extend this design.

---

# Persistence Strategy

The platform stores only information required for:

- User authentication
- Career profile
- Job applications
- AI-generated documents
- Application history

Temporary AI responses should not be persisted unless they become part of the user's workflow.

---

# Scalability Strategy

The model has been designed for future expansion.

Examples:

- Multiple CV versions
- Recruiter management
- Interview history
- Career analytics
- Learning recommendations
- Networking relationships

These capabilities can be introduced without redesigning the existing entities.

---

# Design Principles

The data model follows these principles:

- One source of truth.
- Clear ownership.
- Normalized relationships.
- Business-oriented entities.
- Future extensibility.
- Minimal duplication.

---

# Database Philosophy

The database is not simply a storage mechanism.

It represents the professional journey of each user.

Every entity contributes to building a structured and connected Career Relationship Management platform capable of growing alongside the user's career.