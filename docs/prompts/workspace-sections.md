# Phase 1: Workspace Layout

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/specs/workspace-sections.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement **only Phase 1 — Workspace Layout** from:

docs/specs/workspace-sections.md

Do not implement any future phase.

---

Phase 1 scope:

- Implement the overall Application Workspace layout.
- Create the Workspace container.
- Create the Overview section.
- Create the main content area.
- The Workspace becomes the primary container for an individual application.
- Display one primary workspace section at a time.
- Keep the current application context visible throughout the Workspace.
- Do not implement navigation.
- Do not integrate Job Analysis.
- Do not create placeholders for future sections.
- Do not modify any backend functionality.
- Do not introduce new business logic.
- Reuse the existing frontend architecture and components whenever possible.

The implementation should replace the current Application detail view as defined in the specification.

The existing user experience outside the Application Workspace must remain unchanged.

---

Before implementing, verify that the requested implementation is fully supported by the documentation.

If the documentation is ambiguous, stop and ask for clarification instead of making architectural decisions.

If the documentation is sufficient, implement only Phase 1.

---

When finished, provide:

1. Summary of the implementation.
2. Files modified.
3. Architectural decisions.
4. Assumptions made (if any).
5. Validation performed.

Do not implement Phase 2 or any later phase.

Wait for review before making additional changes.

# Phase 2: Workspace Navigation

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/specs/workspace-sections.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement **only Phase 2 — Workspace Navigation** from:

docs/specs/workspace-sections.md

Do not implement any future phase.

---

Phase 2 scope:

- Implement navigation between the Application Workspace sections.
- Navigation must clearly indicate:
  - Current section.
  - Completed sections.
  - Next recommended step.
- Navigation must preserve the current application context.
- Users may revisit completed sections at any time.
- Reuse the existing Application Workspace created during Phase 1.
- Reuse existing frontend architecture and components whenever possible.

During this phase:

- Do not integrate Job Analysis.
- Do not implement Profile Match.
- Do not create business logic.
- Do not invoke backend endpoints.
- Do not modify backend functionality.
- Do not implement AI functionality.
- Do not create placeholder content for future sections.
- Do not redesign the existing Application Workspace layout.

Navigation should prepare the Workspace for future phases while remaining fully functional within the current MVP scope.

---

Before implementing, verify that the requested implementation is fully supported by the documentation.

If the documentation is ambiguous, stop and ask for clarification instead of making architectural decisions.

If the documentation is sufficient, implement only Phase 2.

---

When finished, provide:

1. Summary of the implementation.
2. Files modified.
3. Architectural decisions.
4. Assumptions made (if any).
5. Validation performed.

Do not implement Phase 3 or any later phase.

Wait for review before making additional changes.

# Phase 3: Integrate Job Analysis

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/specs/workspace-sections.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement **only Phase 3 — Integrate Job Analysis** from:

docs/specs/workspace-sections.md

Do not implement any future phase.

---

Phase 3 scope:

- Integrate the existing Job Analysis user interface into the Application Workspace.
- Reuse the existing Job Analysis components and frontend architecture whenever possible.
- Preserve the current Job Analysis user experience and behavior.
- The existing Job Analysis functionality must remain functionally equivalent after the integration.
- Enable navigation from Overview to Job Analysis.
- Job Analysis becomes the next available workspace section after Overview.
- Preserve the current application context throughout the Workspace.

During this phase:

- Do not redesign the existing Job Analysis interface.
- Do not modify backend functionality.
- Do not modify API contracts.
- Do not introduce new business logic.
- Do not implement Profile Match.
- Do not enable Profile Match navigation.
- Do not implement Optimized CV.
- Do not implement Cover Letter.
- Do not implement Export.
- Reuse existing frontend components whenever possible instead of creating duplicated functionality.

---

Before implementing, verify that the requested implementation is fully supported by the documentation.

If the documentation is ambiguous, stop and ask for clarification instead of making architectural decisions.

If the documentation is sufficient, implement only Phase 3.

---

When finished, provide:

1. Summary of the implementation.
2. Files modified.
3. Architectural decisions.
4. Assumptions made (if any).
5. Validation performed.

Do not implement Phase 4 or any later phase.

Wait for review before making additional changes.

# Phase 4: Profile Match Section

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/specs/workspace-sections.md
7. docs/specs/job-analysis-2.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement **only Phase 4 — Profile Match Section** from:

docs/specs/workspace-sections.md

Do not implement any future phase.

---

Phase 4 scope:

- Integrate the existing Profile Comparison backend into the Application Workspace.
- Create the Profile Match workspace section.
- Reuse the existing Profile Comparison API and frontend architecture whenever possible.
- Display the complete comparison results already provided by the backend:
  - Matching Skills
  - Missing Skills
  - Strengths
  - Weaknesses
  - Alignment Score (ATS Match)
  - Recommendation
- Preserve the current application context throughout the Workspace.
- Enable navigation from Job Analysis to Profile Match.
- Mark Job Analysis as completed when appropriate.
- Make Profile Match the next available workspace section.

During this phase:

- Do not modify backend functionality.
- Do not modify API contracts.
- Do not modify AI prompts.
- Do not implement CV generation.
- Do not implement Cover Letter generation.
- Do not implement Export.
- Do not redesign the existing Job Analysis interface.
- Reuse existing frontend components whenever possible instead of creating duplicated functionality.

The frontend should present the comparison results exactly as returned by the existing backend without introducing additional interpretation or business logic.

---

Before implementing, verify that the requested implementation is fully supported by the documentation.

If the documentation is ambiguous, stop and ask for clarification instead of making architectural decisions.

If the documentation is sufficient, implement only Phase 4.

---

When finished, provide:

1. Summary of the implementation.
2. Files modified.
3. Architectural decisions.
4. Assumptions made (if any).
5. Validation performed.

Do not implement Phase 5 or any later phase.

Wait for review before making additional changes.

# Phase 5 Optimized CV Section

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/specs/workspace-sections.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement **only Phase 5 — Optimized CV Section** from:

docs/specs/workspace-sections.md

Do not implement any future phase.

---

Phase 5 scope:

- Create the Optimized CV workspace section.
- Integrate the section into the existing Application Workspace navigation.
- Enable access to Optimized CV only after Profile Match has been completed.
- Reuse the existing Application Workspace architecture.
- Preserve the current application context while navigating between sections.

The section should clearly communicate that:

- Optimized CV generation will be implemented in a future Epic.
- No document has been generated yet.

The placeholder must not:

- Simulate generated CV content.
- Simulate AI-generated text.
- Simulate PDF previews.
- Introduce temporary business logic.
- Introduce temporary API calls.

During this phase:

- Do not implement CV generation.
- Do not modify backend functionality.
- Do not modify API contracts.
- Do not introduce AI prompts.
- Do not implement Cover Letter.
- Do not implement Export.
- Do not modify the existing Profile Match behavior.
- Reuse existing frontend components whenever possible.

---

Before implementing, verify that the requested implementation is fully supported by the documentation.

If the documentation is ambiguous, stop and ask for clarification instead of making architectural decisions.

If the documentation is sufficient, implement only Phase 5.

---

When finished, provide:

1. Summary of the implementation.
2. Files modified.
3. Architectural decisions.
4. Assumptions made (if any).
5. Validation performed.

Do not implement Phase 6 or any later phase.

Wait for review before making additional changes.

# Phase 6 Cover Letter Section

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/specs/workspace-sections.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement **only Phase 6 — Cover Letter Section** from:

docs/specs/workspace-sections.md

Do not implement any future phase.

---

Phase 6 scope:

- Create the Cover Letter workspace section.
- Integrate the section into the existing Application Workspace navigation.
- Enable access to Cover Letter only after the Optimized CV section becomes available.
- Reuse the existing Application Workspace architecture.
- Preserve the current application context while navigating between sections.

The section should clearly communicate that:

- Cover Letter generation will be implemented in a future Epic.
- No cover letter has been generated yet.

The placeholder must not:

- Simulate generated cover letter content.
- Simulate AI-generated text.
- Simulate downloadable documents.
- Introduce temporary business logic.
- Introduce temporary API calls.

During this phase:

- Do not implement Cover Letter generation.
- Do not modify backend functionality.
- Do not modify API contracts.
- Do not introduce AI prompts.
- Do not implement Export.
- Do not modify the existing Optimized CV behavior.
- Reuse existing frontend components whenever possible.

---

Before implementing, verify that the requested implementation is fully supported by the documentation.

If the documentation is ambiguous, stop and ask for clarification instead of making architectural decisions.

If the documentation is sufficient, implement only Phase 6.

---

When finished, provide:

1. Summary of the implementation.
2. Files modified.
3. Architectural decisions.
4. Assumptions made (if any).
5. Validation performed.

Do not implement Phase 7 or any later phase.

Wait for review before making additional changes.

# Phase 7 Export Section

Before writing any code, read the project documentation in the following order:

1. docs/engineering/AI_ENGINEERING.md
2. docs/engineering/PROJECT_RULES.md
3. docs/engineering/DEVELOPMENT_GUIDE.md
4. docs/product/05-user-flow.md
5. docs/product/06-application-workspace.md
6. docs/specs/workspace-sections.md

Your implementation must follow the documented architecture, responsibilities, and workflow.

Do not skip the documentation review.

---

Implement **only Phase 7 — Export Section** from:

docs/specs/workspace-sections.md

Do not implement any future Epic.

---

Phase 7 scope:

- Create the Export workspace section.
- Integrate the section into the existing Application Workspace navigation.
- Enable access to Export only after the Cover Letter section becomes available.
- Reuse the existing Application Workspace architecture.
- Preserve the current application context while navigating between sections.

The section should clearly communicate that:

- PDF generation and document export will be implemented in a future Epic.
- No exportable documents are currently available.

The placeholder must not:

- Simulate PDF generation.
- Simulate downloadable files.
- Simulate export progress.
- Introduce temporary business logic.
- Introduce temporary API calls.

During this phase:

- Do not implement PDF generation.
- Do not implement document download.
- Do not modify backend functionality.
- Do not modify API contracts.
- Do not introduce AI prompts.
- Do not modify the existing Cover Letter behavior.
- Reuse existing frontend components whenever possible.

---

Before implementing, verify that the requested implementation is fully supported by the documentation.

If the documentation is ambiguous, stop and ask for clarification instead of making architectural decisions.

If the documentation is sufficient, implement only Phase 7.

---

When finished, provide:

1. Summary of the implementation.
2. Files modified.
3. Architectural decisions.
4. Assumptions made (if any).
5. Validation performed.

This completes the Workspace Sections Epic.

Wait for review before making any further improvements or refactoring.