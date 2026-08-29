The updated Master CV profile-photo specification is approved for implementation.

Implement only the approved photo positioning improvement described in:
docs/specs/master-cv-profile-photo.md

Read the updated specification and affected architecture/engineering documents before coding.

Preserve the existing Railway Bucket architecture and current photo upload/replace/remove behavior.

Implement:

- Larger 84-unit square photo in the CV header.
- 8-unit trailing/right inset.
- User-controlled X/Y positioning from 0–100.
- Drag-to-position UX in the Master CV photo control.
- Accessible positioning controls.
- Center/reset control.
- Explicit apply/save behavior.
- Persist position on Master CV.
- Snapshot photo position when generating Optimized CV.
- Preview and PDF must use identical percentage positioning.
- Empty photo must remove the photo region entirely.
- Existing Optimized CV snapshots must never change when the Master CV photo or position changes.

Address all specified audit findings:

- Preview/PDF loading-presence consistency
- Import photo-state preservation
- Onboarding upload error handling
- Authenticated blob URL cleanup
- Focused web test coverage
- Non-square photo rendering regression coverage

Do not:

- Change the Railway Bucket architecture.
- Reintroduce Firebase Storage.
- Add a crop-editor dependency unless strictly required by the approved specification.
- Create cropped derivative images.
- Change User.avatar.
- Add photo support to Cover Letter.
- Add AI photo extraction or analysis.
- Add per-application photo selection.
- Introduce unrelated refactors or UI changes.

Update the required Prisma migration and related tests.

Before finishing run:

- typecheck
- lint
- tests
- production build

Also verify that the API starts successfully and that the existing Google authentication flow remains unaffected.

Do not commit, push, merge, or create a PR.

When finished provide:

- Summary
- Files created/modified
- Database migration
- Photo positioning implementation
- Preview/PDF parity
- Tests and validation
- Assumptions/deviations
- Known limitations

Wait for review.
