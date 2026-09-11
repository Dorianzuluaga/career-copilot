The specification
docs/specs/optional-cover-letter.md
is approved.

Implement the Optional Cover Letter feature exactly according to the approved specification.

Important:
- Implement only this feature.
- Do not implement unrelated improvements.
- Do not modify Prisma/schema/migrations.
- Do not change Cover Letter generation prompts, schema, or generation inputs.
- Do not change Job Analysis, Profile Match, or Optimized CV generation behavior.
- Do not change Presentation Language options.
- Do not introduce skip/persistence fields.
- Do not implement any future backlog item.

Follow the implementation phases defined in the spec:
1. Workspace navigation and Optimized CV actions
2. Export UI for missing Cover Letter
3. Backend CV-only branching
4. i18n and regression coverage

The phases are implementation boundaries, not permission to stop after each phase unless necessary.

Critical invariant:
For document: "optimized-cv", the backend must not load Cover Letter data and must not call any Cover Letter generation or adaptation AI function.

Preserve all existing behavior when a saved Cover Letter exists.

Add/update the tests required by the specification.

Before finishing:
- run API tests
- run Web tests
- typecheck
- lint
- build
- formatting/diff check

Do NOT commit anything.

At the end report:
1. Files changed
2. Implementation summary
3. Tests/checks
4. Any deviations from the specification
5. Explicit confirmation that CV-only export cannot trigger Cover Letter AI
6. Explicit confirmation that no unrelated feature was implemented