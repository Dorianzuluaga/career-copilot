# Career Copilot — User Flow

## Purpose

This document describes the overall user journey through Career Copilot, from account creation to generating tailored job application documents.

Unlike the **Application Workflow**, which focuses on the process of creating a single application, this document provides a high-level view of how users navigate the platform.

---

# Main User Journey

```text
Landing Page
      │
      ▼
Sign In / Sign Up
      │
      ▼
Google OAuth Authentication
      │
      ▼
First-Time User?
      │
      ├─────────────── No ───────────────┐
      │                                  │
      ▼                                  │
User Onboarding                          │
      │                                  │
      ▼                                  │
Do you already have a CV?                │
      │                                  │
 ┌────┴─────┐                            │
 │          │                            │
 │ Yes      │ No                         │
 │          │                            │
 ▼          ▼                            │
Upload CV   Manual Form                  │
 │          │                            │
 ▼          ▼                            │
CV Parsing  Create Master CV             │
 │                                       │
 ▼                                       │
Parsing Successful?                      │
 │                                       │
 ┌────┴─────┐                            │
 │          │                            │
 │ Yes      │ No                         │
 │          │                            │
 ▼          ▼                            │
Create      Show Parsing Error           │
Master CV   Redirect to Manual Form      │
 │          │                            │
 └────┬─────┘                            │
      ▼                                  │
Create Style Profile                     │
      │                                  │
      └──────────────┬───────────────────┘
                     ▼
                 Dashboard
                     │
                     ▼
          Create New Application
                     │
                     ▼
            Paste Job Description
                     │
                     ▼
              AI Job Analysis
                     │
                     ▼
        Select Application Mode
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Fast Apply           Guided Apply
          │                     │
          ▼                     ▼
Automatic CV             AI Recommendations
Adaptation                     │
          │                     ▼
          │         Accept / Reject / Edit
          └──────────┬──────────┘
                     ▼
               Live Preview
                     │
                     ▼
      Manual Editing (Optional)
                     │
                     ▼
             Generate PDF
                     │
                     ▼
          Save Application Version
                     │
                     ▼
          Application History
                     │
                     ▼
                 Dashboard
```

---

# User Journey Stages

## 1. Authentication

Users authenticate using Google OAuth.

New users continue through the onboarding process, while returning users are redirected to the dashboard.

---

## 2. Onboarding

Users establish their professional profile by either:

* Uploading an existing CV.
* Completing a guided form manually.

If the uploaded CV cannot be parsed (for example, because it is image-based or unreadable), Career Copilot explains the issue and redirects the user to the manual onboarding flow.

Successful onboarding creates:

* Master CV
* Style Profile

---

## 3. Dashboard

The dashboard is the central workspace where users can:

* Create a new application.
* View previous applications.
* Manage their Master CV.
* Update their Style Profile.
* Access future platform features.

---

## 4. Job Application

Users paste a job description and Career Copilot analyzes the opportunity.

The user then chooses between two application modes:

### Fast Apply

Designed for speed.

Career Copilot automatically adapts the Master CV based on the job requirements.

Ideal for time-sensitive applications.

---

### Guided Apply

Designed for maximum control.

Career Copilot presents AI-generated recommendations that users can accept, reject, or modify before generating the final version.

Ideal for highly competitive opportunities.

---

## 5. Preview & Manual Editing

Regardless of the selected application mode, every generated CV follows the same final review process.

Users can:

* Review the generated content.
* Edit any section manually.
* Make final adjustments.

This ensures that users always remain in control of the final document.

---

## 6. PDF Generation

After user confirmation, Career Copilot generates the final PDF while preserving the user's Style Profile.

The generated version is stored and linked to the corresponding job application for future reference.

---

# Product Principles

The user flow is designed around the following principles:

* Minimize repetitive work.
* Preserve a single source of truth through the Master CV.
* Keep users in control of every generated document.
* Offer both speed and customization through Fast Apply and Guided Apply.
* Generate PDFs only after user approval.
* Store every generated application for future access and reuse.
