# Feature Specification

## Feature Information

**Feature Name**

Global Light/Dark Theme

**Status**

Draft

**Priority**

Medium

---

# Purpose

Allow users to view Career Copilot in Light or Dark mode without changing existing product behavior.

The current application is Light-only. Users who prefer a darker interface cannot keep that preference across navigation or reloads.

Expected outcome:

- The application supports Light and Dark modes.
- Light remains the default appearance and the current visual identity.
- Users can switch theme from Login and from authenticated layouts.
- The selected theme persists across navigation and reloads.
- Document previews stay paper-white.
- Generated PDFs remain unchanged.

This feature is application chrome theming. It is not the Style Profile described in product documentation, and it is not export document theming.

---

# Dependencies

- Existing frontend application
- Existing Tailwind CSS semantic tokens
- Existing Locale persistence pattern
- Existing Login screen
- Existing authenticated layout

---

# Context Required

Load only:

- Product DNA
- Technology Stack
- Folder Structure
- AI Engineering Guide
- Project Rules
- Development Guide
- This specification

---

# User Workflow

1. User opens Career Copilot.
2. The application appears in Light mode unless the user previously selected Dark mode on that browser.
3. User finds an accessible theme toggle on the Login screen.
4. User selects Light or Dark.
5. The application appearance updates immediately.
6. User signs in.
7. The same theme remains active on authenticated screens.
8. User can change the theme again from the authenticated layout.
9. User reloads the application or navigates between routes.
10. The last selected theme is restored.

If no theme has been stored, or the stored value is invalid, the application uses Light mode.

---

# Functional Requirements

- Provide Light mode and Dark mode.
- Use Light mode as the default theme.
- Provide only Light and Dark. Do not provide a System mode.
- Persist the selected theme in `localStorage`, following the existing locale persistence pattern.
- Restore the stored theme after navigation and reloads.
- Apply the selected theme across existing routes and shared UI.
- Provide an accessible theme toggle in the global UI.
- Show the theme toggle on the Login screen.
- Show the theme toggle on authenticated layouts.
- Keep the existing navy header and chrome as part of the visual identity in both modes.
- Theme the application through semantic CSS tokens.
- Do not add a `dark:` class sweep across individual pages unless a specific surface cannot be themed through tokens.
- Keep document previews paper-white and independent from the application theme.
- Leave PDF generation and PDF appearance unchanged.
- Prevent an initial Light flash of a stored Dark theme where practical.
- Do not change backend, API, Firebase, Prisma, PostgreSQL, or Railway behavior.

---

# Business Rules

- Light and Dark are the only supported themes.
- Light is the default.
- The theme is a browser preference, not a user-account setting.
- The theme must not be stored in the backend.
- The theme must persist in `localStorage` using the same persistence approach as locale.
- If `localStorage` is unavailable, the application must remain usable and default to Light.
- If the stored value is missing or invalid, the application must use Light.
- Changing theme must not require confirmation.
- Changing theme must not reload the application.
- Changing theme must not alter authentication, routing, or business data.
- The navy header/chrome remains navy in both modes.
- Brand blue remains the primary accent in both modes.
- `text-white` on navy and brand surfaces is on-accent contrast and must not invert with the theme.
- Google logo colors must not change.
- Native browser dialogs such as `window.confirm` are outside application theming.
- Style Profile and export document themes are separate product concepts and must not be implemented by this feature.
- This feature must not introduce new dependencies.

---

# UI Requirements

## Theme Toggle

The theme toggle must:

- Be visible without opening a settings page.
- Appear on the Login screen for unauthenticated users.
- Appear in the authenticated global layout.
- Switch between Light and Dark only.
- Expose an accessible name.
- Communicate the current theme.
- Be operable with a keyboard.
- Not rely on color alone to communicate state.
- Use the existing interface language catalogs for its accessible name and visible label, if a visible label is shown.
- Not introduce a Settings navigation item.

The authenticated toggle belongs in the existing global header chrome, alongside the current account controls.

The Login toggle must remain visible on the Login screen and must not replace, hide, or change the behavior of Continue with Google.

Transient session-restore loading screens are not required to display the toggle. They must still use the restored theme.

## Application Chrome

The following surfaces must follow the selected application theme:

- Page backgrounds
- Cards and elevated surfaces
- Body text, muted text, and headings
- Borders and dividers
- Forms, inputs, textareas, selects, and checkboxes
- Buttons and disabled states
- Sidebar, footer, and page content
- Alerts, validation errors, toasts, and confirmation dialogs
- Empty, loading, and error states
- Focus and hover states

The existing navy header remains navy in both Light and Dark modes.

## Login Screen

- Keep the current Login content and actions.
- Apply the selected theme to the Login background, card, text, and button chrome.
- Display the theme toggle.

## Authenticated Layout

- Keep the current navigation, language selector, and Profile control.
- Apply the selected theme to canvas, sidebar, footer, and page content.
- Keep the navy header.
- Display the theme toggle in the header.

## Document Previews

Document previews must remain paper-white in both application themes.

This applies to:

- Optimized CV document views
- Cover Letter document views
- Export document previews

Surrounding workspace chrome, section navigation, actions, and forms follow the application theme.

The document surface itself stays paper-white and independent from Light/Dark.

## Routes

Every existing route must support the selected theme:

- `/`
- `/login`
- `/onboarding/master-cv`
- `/master-cv`
- `/dashboard`
- `/profile`
- `/applications/new`
- `/applications/:applicationId`

No new routes are introduced.

### Empty States

Existing empty, loading, and error states must remain functionally unchanged and must use themed application surfaces.

### Placeholder Content

Not applicable.

---

# Navigation

| Route | Behaviour |
| --- | --- |
| `/` | Existing redirect and session restore. Uses the restored theme. Toggle is not required on the transient loading state. |
| `/login` | Existing Login screen, plus the theme toggle. |
| Authenticated routes | Existing layout and navigation, plus the theme toggle in the global header. |

This feature must not change destination routes, authentication redirects, or workspace section navigation.

---

# Implementation Decisions

## Theming Mechanism

- Semantic CSS tokens are the primary theming mechanism.
- Light token values remain the current visual identity.
- Dark mode overrides the same semantic tokens.
- Existing utility classes and shared `cc-*` chrome should follow those tokens.
- `dark:` utilities may be used only when a specific surface cannot be themed through token overrides.
- Do not restyle pages one by one as the default approach.

## Persistence

Follow the existing locale pattern:

- Read the stored value when the application starts.
- Write the selected value when the user changes theme.
- Use a Career Copilot-prefixed `localStorage` key.
- Store only `light` or `dark`.
- Fall back to Light when the value is missing, invalid, or unreadable.

Suggested key, matching `career-copilot.locale`:

```
career-copilot.theme
```

## Default and Mode Model

- Default: Light
- Supported values: `light`, `dark`
- No System option
- Do not follow `prefers-color-scheme` as a user-selectable mode
- `prefers-color-scheme` must not override a stored user choice
- First visit with no stored value uses Light, even if the operating system is in Dark mode

## Visual Identity

- Keep the navy header/chrome in both modes.
- Keep brand blue as the primary accent.
- Keep current Light appearance unless a token must be split so Dark mode can preserve contrast.
- `navy` is chrome, not body text. Body text uses ink/muted tokens.
- Dark surfaces, borders, and status colors must remain readable against Dark backgrounds.
- Exact Dark hex values are not prescribed by this specification, provided the visual identity above is preserved.

## Initial Theme Flash

If the stored theme is Dark, the first painted frame should not appear in Light mode where practical.

Theme restoration must not wait for a later authenticated layout render.

Login, session restore, and authenticated screens must all honor the stored theme.

## Document Previews and PDFs

- Application theme must not change PDF rendering.
- Application theme must not change exported file contents.
- Document preview surfaces stay paper-white.
- Backend PDF generation is out of scope and must not be modified.

## Architecture Constraints

- Frontend presentation only.
- Reuse the existing Context + hook persistence pattern used by locale.
- Reuse existing layout chrome rather than adding a settings page.
- Do not add a theming library.
- Do not add new runtime dependencies.
- Do not modify API, backend, Firebase, Prisma, PostgreSQL, or Railway.

---

# Acceptance Criteria

### AC1

Given a user opens Career Copilot for the first time

When no theme is stored

Then the application is displayed in Light mode.

---

### AC2

Given the Login screen

When the page is displayed

Then an accessible theme toggle is visible and the current Login behavior is unchanged.

---

### AC3

Given the Login screen

When the user selects Dark mode

Then the Login screen updates to Dark mode without changing authentication.

---

### AC4

Given an authenticated layout

When the page is displayed

Then an accessible theme toggle is visible in the global header and existing navigation remains unchanged.

---

### AC5

Given any existing application screen

When the user selects Dark mode

Then application backgrounds, surfaces, text, borders, forms, buttons, and UI states update to Dark mode.

---

### AC6

Given Dark mode is selected

When the user navigates to another existing route

Then Dark mode remains active.

---

### AC7

Given Dark mode is stored

When the user reloads the application

Then Dark mode is restored, including on Login if the user is unauthenticated.

---

### AC8

Given Light mode is selected after Dark mode

When the user reloads the application

Then Light mode is restored.

---

### AC9

Given an invalid or unreadable stored theme

When the application loads

Then Light mode is used and the application remains usable.

---

### AC10

Given Dark mode

When the authenticated layout is displayed

Then the header remains navy and existing header controls remain readable.

---

### AC11

Given Dark mode

When the user views an Optimized CV, Cover Letter, or Export document preview

Then the document surface remains paper-white.

---

### AC12

Given either application theme

When the user exports a PDF

Then PDF generation, contents, and appearance are unchanged.

---

### AC13

Given a stored Dark theme

When the application first paints

Then the first visible frame is Dark where practical, rather than a Light flash followed by Dark mode.

---

### AC14

Given the theme toggle

When a keyboard or assistive-technology user operates it

Then the control has an accessible name, communicates the current theme, and changes the theme.

---

### AC15

Given this feature is implemented

When reviewing the system boundary

Then no backend, API, Firebase, Prisma, PostgreSQL, or Railway changes are required for the feature to work.

---

# Technical Notes

- Follow the existing frontend architecture.
- Reuse Locale persistence, provider, and header-control patterns.
- Put theme state in the frontend presentation layer.
- Prefer token overrides in global styles over page-level restyling.
- Apply `color-scheme` so native form controls match the selected theme.
- Add interface strings to the existing locale catalogs.
- Existing tests that render the header and Login will need to keep current behavior and cover the new toggle.
- Visual contrast in Dark mode must be verified; markup tests will not catch unreadable tokens.
- Do not implement Style Profile.
- Do not implement export document themes.
- Do not redesign the UI.

---

# AI Considerations

Not applicable.

---

# Out of Scope

- System theme mode
- Following the operating system as the default
- Account-level or backend-persisted theme
- New settings page or Settings navigation item
- UI redesign
- Changes to business logic
- Changes to authentication or Firebase
- Changes to API, Prisma, PostgreSQL, or Railway
- Changes to PDF generation or PDF appearance
- Style Profile
- Export visual themes or custom document templates
- New runtime dependencies
- Theming native browser dialogs such as `window.confirm`

---

# Related Documentation

- Product DNA
- Technology Stack
- Folder Structure
- AI Engineering Guide
- Project Rules
- Development Guide
- Export Specification
- Master CV Onboarding Specification

---

# Remaining Ambiguities

These items do not change the decisions above. They should be resolved during implementation review if needed:

- Exact toggle control type: button, switch, or select. Any accessible Light/Dark control that meets this specification is acceptable.
- Exact Login toggle placement, provided it is visible on the Login screen and does not interfere with Continue with Google.
- Exact Dark token values, provided navy chrome, brand accent, readable contrast, and Light as the unchanged default are preserved.

---

# Spec Validation Checklist

- [x] User workflow completely defined.
- [x] Navigation between screens defined.
- [x] CRUD interactions defined (if applicable).
- [x] Business rules defined.
- [x] UI requirements defined.
- [x] UI placeholders defined (if applicable).
- [x] Acceptance criteria defined.
- [x] Out of scope defined.
- [ ] No ambiguous requirements.
