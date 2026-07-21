# Career Copilot — Application Workflow

## Purpose

Career Copilot is designed to reduce the time and effort required to prepare high-quality job applications while keeping the user in full control of the final result.

The application is not intended to be a simple CV generator. Instead, it acts as an AI-powered assistant that helps users create tailored applications starting from a single source of truth: the **Master CV**.

---

# Core Concepts

## Master CV

The Master CV is the user's single source of truth.

It contains all professional information in a structured format and is independent of any specific job application.

The Master CV can be created in two ways:

* Uploading an existing CV that is successfully parsed.
* Completing the onboarding form manually.

---

## Style Profile

The Style Profile stores the user's preferred visual identity.

Examples include:

* Layout
* Typography
* Colors
* Section order
* Spacing

If an uploaded CV contains enough design information, the application extracts and stores these style preferences.

Otherwise, the user selects a template during onboarding.

---

## Job Application Workspace

Each job application creates a temporary workspace where Career Copilot performs the complete optimization process.

The workspace contains:

* Job offer
* AI analysis
* Suggested improvements
* Generated CV version
* Cover letter (future)
* Generated PDF

The Master CV is never modified automatically.

---

# User Onboarding

## Option 1 — Existing CV

User uploads a CV.

The system attempts to parse both:

* Content
* Style metadata

### Successful parsing

* Create Master CV
* Create Style Profile

### Failed parsing

If the document cannot be parsed (for example, because it is an image-only PDF or contains unreadable content), the user receives a clear explanation and is redirected to the manual onboarding form.

---

## Option 2 — No Existing CV

The user completes a guided form.

The application creates:

* Master CV
* Style Profile (from a selected template)

---

# Application Modes

Career Copilot offers two application modes depending on the user's available time and desired level of control.

---

## Fast Apply

Designed for speed.

Workflow:

1. Paste the job offer.
2. AI analyzes the requirements.
3. The Master CV is adapted automatically.
4. A preview is generated.
5. The user may edit any section manually.
6. Generate the final PDF.
7. Save the generated application.

Target completion time:

Less than two minutes.

Ideal for:

* Mobile usage
* Time-sensitive opportunities
* Quick applications

---

## Guided Apply

Designed for maximum customization.

Workflow:

1. Paste the job offer.
2. AI analyzes the requirements.
3. AI generates recommendations.
4. The user accepts, rejects or edits the suggestions.
5. A preview is generated.
6. The user may edit any section manually.
7. Generate the final PDF.
8. Save the generated application.

Ideal for:

* High-value opportunities
* Competitive hiring processes
* Users who want full control

---

# Preview Before PDF Generation

Both application modes converge into the same final workflow.

The PDF is never generated immediately.

Instead, users always receive a live preview where they can:

* Review the generated content.
* Edit any section manually.
* Make final adjustments.

Only after user confirmation is the PDF generated.

---

# Product Principles

Career Copilot follows these principles:

* The Master CV is the single source of truth.
* Users always remain in control.
* AI suggests; users decide.
* The application minimizes repetitive work.
* The final PDF is generated only after user approval.
* Every generated application is linked to a specific job opportunity.

# flowcharts

# FAST APPLY

Paste job offer

↓

AI analysis

↓

Automatic adaptation of the Master CV

↓

Preview

↓

Manual edition (optional)

↓

Generate PDF

↓

Save version of the application

# GUIDED APPLY

Paste job offer 

↓

Analysis IA

↓

IA recomendations

↓

Accept / Reject / Edit recommendations

↓

Preview

↓

Manual edition (optional)

↓

Generate PDF

↓

Save version of the application