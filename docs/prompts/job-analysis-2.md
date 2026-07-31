# Phase 1: Compare Master CV vs Job Analysis

# Task: Job Analysis 2 — Phase 1 (Profile Comparison Engine)

We are starting the implementation of **Job Analysis 2**.

Before writing any code, you MUST understand the project documentation and architecture.

## Step 1 — Read the Project Documentation

Read the following documentation completely before making any proposal or implementation.

### Product

- docs/product/

### Architecture

- docs/architecture/

### Engineering Rules

- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

### Specification

Read the approved specification for:

- docs/specs/job-analysis-2.md

Also review the previous completed specification to understand the expected input of this Epic:

- docs/specs/job-analysis.md

Do not skip any of these documents.

They define the product decisions that must be respected.

---

# Step 2 — Understand the Context

Confirm that you understand:

- the project architecture
- the MVP scope
- the engineering rules
- the responsibilities of Job Analysis
- the responsibilities of Job Analysis 2

If you detect contradictions, ambiguities or missing dependencies, stop and explain them before implementing anything.

Do not make product decisions yourself.

---

# Step 3 — Implement ONLY Phase 1

Implement exclusively the functionality defined in:

## Phase 1 — Compare Master CV vs Job Analysis

The objective of this phase is only to prepare the comparison process.

The implementation must:

- Retrieve the authenticated user's active Master CV.
- Retrieve the structured Job Analysis associated with the current Application Workspace.
- Verify that both resources exist.
- Prepare both resources to be sent to the Profile Comparison Engine.
- Do NOT perform any comparison yet.
- Do NOT calculate Profile Alignment Score.
- Do NOT generate Matching Skills.
- Do NOT generate Missing Skills.
- Do NOT generate Strengths.
- Do NOT generate Weaknesses.
- Do NOT generate Recommendation.

This phase is only responsible for preparing the comparison inputs.

---

# Constraints

Respect every rule defined in PROJECT_RULES.md.

Follow the existing architecture.

Do not introduce new libraries unless absolutely necessary.

Do not modify unrelated files.

Do not refactor unrelated code.

Do not implement future phases.

---

# Deliverables

When finished, provide:

1. A summary of the implemented changes.

2. The list of modified files.

3. Any architectural decisions taken during the implementation.

4. Any assumptions made due to missing information.

5. Any recommendations before starting Phase 2.

Stop after completing Phase 1.

# Phase 2: Matching Skills

# Task: Job Analysis 2 — Phase 1 (Profile Comparison Engine)

We are starting the implementation of **Job Analysis 2**.

Before writing any code, you MUST understand the project documentation and architecture.

## Step 1 — Read the Project Documentation

Read the following documentation completely before making any proposal or implementation.

### Product

- docs/product/

### Architecture

- docs/architecture/

### Engineering Rules

- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

### Specification

Read the approved specification for:

- docs/specs/job-analysis-2.md

Also review the previous completed specification to understand the expected input of this Epic:

- docs/specs/job-analysis.md

Do not skip any of these documents.

They define the product decisions that must be respected.

---

# Step 2 — Understand the Context

Confirm that you understand:

- the project architecture
- the MVP scope
- the engineering rules
- the responsibilities of Job Analysis
- the responsibilities of Job Analysis 2

If you detect contradictions, ambiguities or missing dependencies, stop and explain them before implementing anything.

Do not make product decisions yourself.

---

# Step 3 — Implement ONLY Phase 1

Implement exclusively the functionality defined in:

## Phase 1 — Compare Master CV vs Job Analysis

The objective of this phase is only to prepare the comparison process.

The implementation must:

- Retrieve the authenticated user's active Master CV.
- Retrieve the structured Job Analysis associated with the current Application Workspace.
- Verify that both resources exist.
- Prepare both resources to be sent to the Profile Comparison Engine.
- Do NOT perform any comparison yet.
- Do NOT calculate Profile Alignment Score.
- Do NOT generate Matching Skills.
- Do NOT generate Missing Skills.
- Do NOT generate Strengths.
- Do NOT generate Weaknesses.
- Do NOT generate Recommendation.

This phase is only responsible for preparing the comparison inputs.

---

# Constraints

Respect every rule defined in PROJECT_RULES.md.

Follow the existing architecture.

Do not introduce new libraries unless absolutely necessary.

Do not modify unrelated files.

Do not refactor unrelated code.

Do not implement future phases.

---

# Deliverables

When finished, provide:

1. A summary of the implemented changes.

2. The list of modified files.

3. Any architectural decisions taken during the implementation.

4. Any assumptions made due to missing information.

5. Any recommendations before starting Phase 2.

Stop after completing Phase 1.

# Phase 3: Missing Skills

# Task: Job Analysis 2 — Phase 3 (Missing Skills)

We are starting the implementation of **Phase 3** of Job Analysis 2.

Phase 1 and Phase 2 have already been implemented and approved.

Do not modify the approved implementation unless a critical defect is discovered.

---

# Step 1 — Read the Project Documentation

Before writing any code, read the project documentation completely.

## Product

- docs/product/

## Architecture

- docs/architecture/

## Engineering Rules

- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

## Specifications

Read:

- docs/specs/job-analysis.md
- docs/specs/job-analysis-2.md

Do not skip any document.

These documents are the single source of truth for product decisions.

---

# Step 2 — Understand the Context

Confirm that you understand:

- the current architecture
- the MVP scope
- the responsibilities of Job Analysis
- the responsibilities of Job Analysis 2
- the approved implementation of Phase 1
- the approved implementation of Phase 2

If you detect contradictions, ambiguities or missing dependencies, stop and explain them before implementing anything.

If the approved specification does not define an implementation detail required to complete the current phase (such as an API contract, request model, response model or architectural decision), stop and ask for clarification.

Do not invent product or architecture decisions.

---

# Step 3 — Verify the Existing Architecture

Before creating any new resource (route, controller, service, repository, model or type), verify whether an existing one should be extended according to the project's architecture.

Reuse existing components whenever possible.

Avoid duplicating functionality.

---

# Step 4 — Implement ONLY Phase 3

Implement exclusively the functionality defined in:

## Phase 3 — Missing Skills

The implementation must:

- Reuse the approved implementation from Phases 1 and 2.
- Use the same prepared comparison inputs.
- Extend the existing profile comparison flow.
- Identify professional skills required by the Job Analysis that are **not reasonably supported** by the user's Master CV.
- Return Missing Skills as a concise list of plain strings.
- Return only skills supported by evidence in the Job Analysis.
- Do not infer, invent or hallucinate missing skills.
- Ignore technologies, responsibilities or qualifications that are not actual professional skills.
- Follow the AI Design Principles defined in the specification.

---

# Out of Scope

Do NOT implement:

- Strengths
- Weaknesses
- Profile Alignment Score
- Recommendation

Do NOT modify the Master CV.

Do NOT modify the Job Analysis.

Do NOT persist comparison results.

Do NOT implement future phases.

---

# Constraints

Respect every rule defined in PROJECT_RULES.md.

Follow the existing architecture.

Reuse the existing AI service whenever appropriate instead of creating parallel comparison flows.

Do not introduce new libraries unless absolutely necessary.

Do not modify unrelated files.

Do not refactor unrelated code.

---

# Deliverables

When finished, provide:

1. A summary of the implemented changes.

2. The list of modified files.

3. Any architectural decisions taken during the implementation.

4. Any assumptions made due to missing information.

5. Confirmation that no future phase has been implemented.

Stop after completing Phase 3.

# Phase 4: Strengths

# Task: Job Analysis 2 — Phase 4 (Strengths)

We are starting the implementation of **Phase 4** of Job Analysis 2.

Phases 1, 2 and 3 have already been implemented and approved.

Do not modify the approved implementation unless a critical defect is discovered.

---

# Step 1 — Read the Project Documentation

Before writing any code, read the project documentation completely.

## Product

- docs/product/

## Architecture

- docs/architecture/

## Engineering Rules

- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

## Specifications

Read:

- docs/specs/job-analysis.md
- docs/specs/job-analysis-2.md

Do not skip any document.

These documents are the single source of truth for product decisions.

---

# Step 2 — Understand the Context

Confirm that you understand:

- the current architecture
- the MVP scope
- the responsibilities of Job Analysis
- the responsibilities of Job Analysis 2
- the approved implementation of Phases 1, 2 and 3

If you detect contradictions, ambiguities or missing dependencies, stop and explain them before implementing anything.

If the approved specification does not define an implementation detail required to complete the current phase (such as an API contract, request model, response model or architectural decision), stop and ask for clarification.

Do not invent product or architecture decisions.

---

# Step 3 — Verify the Existing Architecture

Before creating any new resource (route, controller, service, repository, model or type), verify whether an existing one should be extended according to the project's architecture.

Reuse existing components whenever possible.

Avoid duplicating functionality.

---

# Step 4 — Implement ONLY Phase 4

Implement exclusively the functionality defined in:

## Phase 4 — Strengths

The implementation must:

- Reuse the approved implementation from Phases 1, 2 and 3.
- Use the same prepared comparison inputs.
- Extend the existing profile comparison flow.
- Identify **3 to 5 professional strengths** demonstrated by the user's Master CV when compared with the Job Analysis.
- Every strength must be supported by explicit evidence contained in the Master CV.
- The strengths must explain why the profile aligns well with the Job Analysis.
- Return the strengths as concise plain-language sentences.
- Do not invent achievements, experience or qualifications.
- Do not exaggerate the candidate's profile.
- Follow the AI Design Principles defined in the specification.

---

# Out of Scope

Do NOT implement:

- Weaknesses
- Profile Alignment Score
- Recommendation

Do NOT modify the Master CV.

Do NOT modify the Job Analysis.

Do NOT persist comparison results.

Do NOT implement future phases.

---

# Constraints

Respect every rule defined in PROJECT_RULES.md.

Follow the existing architecture.

Reuse the existing `profile-comparison-ai.service.ts` instead of creating parallel AI services.

Keep the response contract incremental.

Do not introduce new libraries unless absolutely necessary.

Do not modify unrelated files.

Do not refactor unrelated code.

---

# Deliverables

When finished, provide:

1. A summary of the implemented changes.

2. The list of modified files.

3. Any architectural decisions taken during the implementation.

4. Any assumptions made due to missing information.

5. Confirmation that no future phase has been implemented.

Stop after completing Phase 4.

# Phase 5: Weaknesses

# Task: Job Analysis 2 — Phase 5 (Weaknesses)

We are starting the implementation of **Phase 5** of Job Analysis 2.

Phases 1, 2, 3 and 4 have already been implemented and approved.

Do not modify the approved implementation unless a critical defect is discovered.

---

# Step 1 — Read the Project Documentation

Before writing any code, read the project documentation completely.

## Product

- docs/product/

## Architecture

- docs/architecture/

## Engineering Rules

- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

## Specifications

Read:

- docs/specs/job-analysis.md
- docs/specs/job-analysis-2.md

Do not skip any document.

These documents are the single source of truth for product decisions.

---

# Step 2 — Understand the Context

Confirm that you understand:

- the current architecture
- the MVP scope
- the responsibilities of Job Analysis
- the responsibilities of Job Analysis 2
- the approved implementation of Phases 1–4

If you detect contradictions, ambiguities or missing dependencies, stop and explain them before implementing anything.

If the approved specification does not define an implementation detail required to complete the current phase (such as an API contract, request model, response model or architectural decision), stop and ask for clarification.

Do not invent product or architecture decisions.

---

# Step 3 — Verify the Existing Architecture

Before creating any new resource (route, controller, service, repository, model or type), verify whether an existing one should be extended according to the project's architecture.

Reuse existing components whenever possible.

Avoid duplicating functionality.

---

# Step 4 — Implement ONLY Phase 5

Implement exclusively the functionality defined in:

## Phase 5 — Weaknesses

The implementation must:

- Reuse the approved implementation from Phases 1–4.
- Use the same prepared comparison inputs.
- Extend the existing profile comparison flow.
- Identify **3 to 5 profile weaknesses** that explain where the user's Master CV is less aligned with the Job Analysis.
- Every weakness must be supported by explicit evidence from the comparison.
- Weaknesses must describe missing or insufficient alignment, never personal criticism.
- Return the weaknesses as concise plain-language sentences.
- Return fewer than three weaknesses, including an empty list, when there is insufficient evidence.
- Do not invent missing experience, qualifications or achievements.
- Do not exaggerate deficiencies.
- Do not generate recommendations or suggestions.
- Base the result exclusively on the provided Master CV and Job Analysis.
- Follow the AI Design Principles defined in the specification.

---

# Out of Scope

Do NOT implement:

- Profile Alignment Score
- Recommendation

Do NOT modify the Master CV.

Do NOT modify the Job Analysis.

Do NOT persist comparison results.

Do NOT implement future phases.

---

# Constraints

Respect every rule defined in PROJECT_RULES.md.

Follow the existing architecture.

Reuse the existing `profile-comparison-ai.service.ts` instead of creating parallel AI services.

Keep the response contract incremental.

Do not introduce new libraries unless absolutely necessary.

Do not modify unrelated files.

Do not refactor unrelated code.

---

# Deliverables

When finished, provide:

1. A summary of the implemented changes.

2. The list of modified files.

3. Any architectural decisions taken during the implementation.

4. Any assumptions made due to missing information.

5. Confirmation that no future phase has been implemented.

Stop after completing Phase 5.

# Phase 6: Profile Alignment Score

# Task: Job Analysis 2 — Phase 6 (Profile Alignment Score)

We are starting the implementation of **Phase 6** of Job Analysis 2.

Phases 1, 2, 3, 4 and 5 have already been implemented and approved.

Do not modify the approved implementation unless a critical defect is discovered.

---

# Step 1 — Read the Project Documentation

Before writing any code, read the project documentation completely.

## Product

- docs/product/

## Architecture

- docs/architecture/

## Engineering Rules

- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

## Specifications

Read:

- docs/specs/job-analysis.md
- docs/specs/job-analysis-2.md

Do not skip any document.

These documents are the single source of truth for product decisions.

---

# Step 2 — Understand the Context

Confirm that you understand:

- the current architecture
- the MVP scope
- the responsibilities of Job Analysis
- the responsibilities of Job Analysis 2
- the approved implementation of Phases 1–5
- the approved Profile Alignment Score specification

If you detect contradictions, ambiguities or missing dependencies, stop and explain them before implementing anything.

If the approved specification does not define an implementation detail required to complete the current phase, stop and ask for clarification.

Do not invent product or architecture decisions.

---

# Step 3 — Verify the Existing Architecture

Before creating any new resource (route, controller, service, repository, model or type), verify whether an existing one should be extended according to the project's architecture.

Reuse existing components whenever possible.

Avoid duplicating functionality.

---

# Step 4 — Implement ONLY Phase 6

Implement exclusively the functionality defined in:

## Phase 6 — Profile Alignment Score

The implementation must:

- Reuse the approved implementation from Phases 1–5.
- Extend the existing profile comparison flow.
- Reuse the same prepared comparison inputs.
- Generate an integer `alignmentScore` between **0** and **100**.
- Generate an internal `alignmentReasoning` string supporting the calculated score.
- Base the evaluation on the complete comparison, including:

  - Matching Skills
  - Missing Skills
  - Strengths
  - Weaknesses

- Evaluate the profile holistically.
- Do NOT calculate the score as a simple arithmetic formula based only on matching or missing skills.
- Consider the overall quality of the profile whenever supported by evidence.
- Produce realistic and internally consistent scores.
- Prefer balanced evaluations over extreme values.
- Avoid returning **0** or **100** unless overwhelmingly justified by the available evidence.
- Ensure that the generated reasoning explains the primary factors influencing the score.
- Keep the reasoning concise and intended for internal system use only.

---

# MVP Constraint

The API must return both:

- `alignmentScore`
- `alignmentReasoning`

However:

`alignmentReasoning` is **not** intended for the MVP user interface.

It exists only as part of the API contract to support future explainability, debugging and coaching features.

---

# Out of Scope

Do NOT implement:

- Recommendation
- AI coaching
- Career advice
- Interview prediction
- Hiring probability
- ATS simulation
- Persistence of comparison results

Do NOT modify the Master CV.

Do NOT modify the Job Analysis.

Do NOT implement future phases.

---

# Constraints

Respect every rule defined in PROJECT_RULES.md.

Follow the existing architecture.

Reuse the existing `profile-comparison-ai.service.ts`.

Do not create additional AI services.

Keep the response contract incremental.

Do not introduce new libraries unless absolutely necessary.

Do not modify unrelated files.

Do not refactor unrelated code.

---

# Deliverables

When finished, provide:

1. A summary of the implemented changes.

2. The list of modified files.

3. Any architectural decisions taken during the implementation.

4. Any assumptions made due to missing information.

5. Confirmation that no future phase has been implemented.

Stop after completing Phase 6.

# Phase 7 Recommendation

The documentation and current Phase 1–6 flow are consistent for Phase 7.

Implement ONLY Phase 7 (Recommendation).

Reuse the existing route, controller, prepared inputs, comparison flow, response contract, and AI service.

Do not create new services, resources, endpoints, dependencies, persistence, or architectural layers.

The recommendation must be generated only after the complete profile comparison has been produced, including:

- Matching Skills
- Missing Skills
- Strengths
- Weaknesses
- Alignment Score

The recommendation must:

- Be based on the overall Profile Alignment Score together with the evidence produced during the previous comparison phases.
- Provide a concise high-level next step for the user.
- Help the user decide whether to continue with the application.
- Remain fully consistent with the Alignment Score.
- Never introduce new analysis, assumptions, or unsupported evidence.
- Never contradict the previous comparison outputs.
- Never include detailed coaching, learning plans, certifications, interview preparation, or long-term career advice.
- Stay within the scope of this MVP.

Length requirements:

- Maximum 2–3 sentences.
- Clear and concise.
- Natural professional language.

The AI prompt should encourage:

- High alignment → encourage applying.
- Medium alignment → encourage improving the CV before applying.
- Low alignment → recommend strengthening the profile before applying.

Reuse the existing ProfileComparisonAIService.

Follow the same implementation approach used in Phases 2–6:

- JSON Schema structured output.
- Runtime validation.
- Normalization.
- Unit tests.
- Service tests.
- API contract tests.

The recommendation must become part of the existing ProfileComparisonResult.

Do not implement any future functionality beyond this phase.

When finished, summarize:

- Modified files.
- Architectural decisions.
- Validation performed.
- Tests executed.
- Any assumptions made.
