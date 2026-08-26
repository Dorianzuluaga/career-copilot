Before writing code:

1. Read:
   - docs/engineering/AI_ENGINEERING.md
   - docs/engineering/PROJECT_RULES.md
   - docs/engineering/DEVELOPMENT_GUIDE.md
   - docs/specs/global-theme.md

2. Implement only the feature defined in:
   - docs/specs/global-theme.md

Follow the specification exactly.

Implementation priorities:

- Reuse the existing semantic CSS token architecture.
- Reuse the existing LocaleProvider/localStorage pattern where appropriate.
- Keep the current Light appearance unchanged.
- Implement Light/Dark only.
- Add the accessible theme toggle to Login and the authenticated global header.
- Persist the selected theme with `career-copilot.theme`.
- Prevent a stored Dark theme from flashing Light on initial render where practical.
- Keep the navy header/chrome unchanged.
- Keep document previews paper-white.
- Do not affect PDF generation or appearance.
- Add the required i18n strings.
- Add/update tests required by the specification.

Do not implement anything outside the specification.

Do not:

- redesign the UI
- modify business logic
- modify API/backend
- modify authentication/Firebase
- modify Prisma/PostgreSQL
- modify Railway
- add new dependencies
- introduce System theme
- modify PDF generation
- implement Style Profile or export document themes
- perform unrelated refactors

Use a simple accessible button for the theme toggle unless the existing component architecture provides a clearly better equivalent.

If a requirement is genuinely ambiguous or conflicts with the existing architecture, stop and ask before making a product decision.

When implementation is complete, run:

- typecheck
- lint
- tests
- production build

Then provide:

- Summary
- Files modified
- Architectural decisions
- Tests/validation performed
- Assumptions
- Known limitations

Do not commit, push, merge, or create a PR.

Wait for review after implementation.
