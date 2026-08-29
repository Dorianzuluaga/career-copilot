# Feature Specification

## Feature Information

**Feature Name**

Master CV Optional Profile Photo

**Status**

Draft

**Priority**

High

---

# Purpose

Give users an optional profile photo on the Master CV that appears on the Optimized CV preview and the Optimized CV PDF.

Career Copilot already stores Personal Information on the Master CV and copies it onto each Optimized CV at generation time. The header layout can accept a photo sibling. Photo upload, storage, and rendering are still undefined. `User.avatar` is the Google account picture used on the Profile page. It is not CV content.

Expected outcome:

- Users can upload, replace, and remove one optional photo on the Master CV.
- Users can reposition the original image inside its square presentation crop from the Master CV editor.
- The CV header renders a moderately larger photo with additional inset from the trailing page margin.
- Each Optimized CV stores an immutable generation-time snapshot of both the photo asset and its saved position.
- Preview and PDF render that snapshot with exactly the same position, or omit the photo region entirely when it is empty.
- Existing Optimized CVs never change when the Master CV photo asset or position changes.
- Cover Letter rendering stays unchanged.

This specification defines profile photo behavior only. It does not change Job Analysis, Profile Match, Cover Letter generation, Export selection, or filename rules.

---

# Relationship with Existing Specifications

This specification extends:

- `docs/specs/master-cv-personal-information.md`
- `docs/specs/master-cv-onboarding.md`
- `docs/specs/optimized-cv.md`
- `docs/specs/export.md`
- `docs/specs/google-authentication.md`
- `docs/specs/cover-letter.md`

Preserve those documents' terminology and architecture:

- Master CV is the single source of truth.
- Personal information is protected Master CV data.
- Optimized CV copies Personal Information from the Master CV and never invents it.
- Users cannot edit Personal Information inside the Optimized CV.
- Saving the Master CV must not modify existing Optimized CVs.
- Saving an Optimized CV must not modify the Master CV.
- Export renders the latest saved Optimized CV for the document body.
- Export must not read Master CV Personal Information to fill the CV header.
- Preview must match the generated PDF.
- Empty optional values persist as `null`.
- Authentication uses Google sign-in, then an HTTP-only application session. The frontend signs out of Firebase Auth after login.
- Authorization uses the session user. Never trust a client-supplied user ID.
- `User.avatar` remains the Google profile picture. It is not the CV photo.

Where this specification conflicts with those documents on profile photo upload, storage, snapshot, or rendering, this specification has priority. Related documents must not reintroduce Firebase Storage for CV photos.

The Personal Information specification remains the source of truth for identity fields, contact rows, and header content order. This specification owns the photo sibling, photo persistence, and photo reads.

---

# Dependencies

- Google Authentication
- Master CV Onboarding
- Master CV Personal Information and CV Header Redesign
- Optimized CV
- Export
- Existing locale support (English, Spanish, French)
- Railway API deployment
- Private Railway Bucket (S3-compatible object storage)

---

# Context Required

Load only:

- Product DNA
- Optimized CV product documentation
- Export product documentation
- Master CV Onboarding specification
- Master CV Personal Information specification
- Optimized CV specification
- Export specification
- Cover Letter specification (must remain unchanged)
- Google Authentication specification
- API Overview
- Security Overview
- Deployment documentation
- AI Engineering Guide
- Project Rules
- Development Guide
- This specification

---

# Approved Architecture

These rules are not optional:

1. Master CV is the source of truth for the current photo.
2. Optimized CV stores a generation-time photo asset and position snapshot.
3. Preview and PDF read only the Optimized CV asset and position snapshot.
4. Master CV photo asset or position changes must never modify existing Optimized CVs.
5. `User.avatar` is separate and must not be reused as the CV photo.
6. The browser uploads the image to the Career Copilot API.
7. The API validates the file and writes it to a private Railway Bucket using an S3-compatible client.
8. PostgreSQL stores an object key, never a public URL.
9. Ownership comes from the session user and the owned application. Never trust a client-supplied user ID.
10. Each Optimized CV snapshot is an immutable object copy, not a shared overwriteable path.
11. An empty photo means no photo region and no reserved space.
12. Cover Letter remains unchanged.
13. PostgreSQL stores normalized photo positioning metadata with the object key. It does not store cropped image bytes.
14. Positioning is non-destructive. The original validated image remains the only Master CV photo object.
15. Optimized CV generation snapshots the saved position together with the copied photo asset.
16. Preview and PDF use the same normalized position from the Optimized CV snapshot.
17. User-controlled positioning uses the existing browser and renderer capabilities. A crop-editor dependency is not required.

The frontend must not upload to the Railway Bucket. The bucket is private. The browser has no bucket credentials. After login there is no Firebase Auth session, and Firebase Storage is not used. Signed upload URLs are out of scope for V1.

---

# User Workflow

1. User opens the Master CV editor (onboarding or existing-user editor).
2. User sees an optional Profile photo control in Personal Information.
3. User may upload a JPEG, PNG, or WEBP image of at most 2 MB, position it inside the square presentation crop, replace it, or remove it.
4. If the user uploads a CV PDF, extraction does not read or attach any photo.
5. The Google account avatar is not suggested, copied, or displayed as the CV photo.
6. User saves the Master CV. A Master CV without a photo remains valid.
7. User generates or regenerates an Optimized CV for an Application Workspace.
8. If the Master CV has a photo at generation time, the API copies that object to an immutable application snapshot. The Optimized CV stores that asset snapshot and the current saved photo position.
9. If the Master CV has no photo at generation time, the Optimized CV snapshot is empty.
10. User reviews the Optimized CV. The photo and its position are read-only. Empty photo occupies no header space.
11. User previews and downloads the Optimized CV from Export. Preview and PDF use the same asset, position, and omit-when-empty rule.
12. Later Master CV photo upload, reposition, replace, or remove does not change previously generated or saved Optimized CVs.
13. Cover Letter preview and PDF continue to show name plus email and phone only. No photo.

---

# User Workflow Details

## Master CV Editor

The Personal Information section remains a labeled form, not a document preview.

The Profile photo control is the first item in that section, before Full name.

The form always shows the photo control so the user can add, replace, or remove a photo. The omit-when-empty rule applies only to Optimized CV preview and PDF rendering.

When no photo is stored:

- Show the upload control and the optional helper text.
- Do not draw an empty document photo box, circular avatar placeholder, or reserved square that imitates the CV header.

When a photo is stored:

- Show a square crop preview using the same cover and positioning behavior as the document photo.
- Allow direct drag-to-position interaction inside that square.
- Do not expose horizontal, vertical, Center, or other manual position controls.
- Position changes update the local preview immediately.
- Persist the position only when the user applies the replacement or explicitly saves the position. Do not send one API request per pointer movement.
- Show Replace and Remove actions.

Upload and replace persist through the photo API as soon as a Master CV exists. They are not part of the text-field Save action.

Selecting a file opens the local square crop preview before upload. The initial position is centered at `50, 50`. The user may drag the image before applying the photo. Applying a replacement uploads the original file and the selected position atomically.

During onboarding, before the Master CV exists, the user may select and position a photo for local preview. After the Master CV is created successfully, the client uploads that original file and its selected position through the photo API. If the photo upload then fails, the Master CV text remains saved, the failure must be shown to the user, and the user must be able to retry the photo upload or continue without a photo. The failure must not be silently swallowed.

Importing Master CV text from a PDF must preserve the current photo asset identifier and saved position in the editor state. Import still does not extract, replace, remove, or reposition the photo.

Remove is an explicit action on the photo control. No additional confirmation dialog is required, matching other Master CV remove actions.

Saving Personal Information text must not clear, replace, or attach a photo.

## Optimized CV

The photo is protected Master CV information and remains read-only.

Users cannot upload, reposition, replace, crop, or remove the photo inside the Optimized CV.

Users cannot choose a different photo per application.

Generating an Optimized CV snapshots the current Master CV photo asset and its saved position, including the empty state.

A later Master CV photo upload, reposition, replacement, or removal does not change a previously generated or saved Optimized CV until the user generates and saves a new Optimized CV.

Saving Optimized CV edits must not refresh the photo from the Master CV.

## Export

Export behavior is unchanged except that the Optimized CV header may render the snapshot photo at its snapshot position.

Preview and PDF read only the saved Optimized CV asset and position snapshot.

Export filenames remain owned by Master CV `fullName` and optional `professionalTitle`. The photo does not affect filenames.

---

# Data Model

The current photo belongs to the Master CV.

Each Optimized CV stores its own snapshot reference.

`User.avatar` is unchanged and is not a Personal Information field.

## Fields

| Field                   | Owner        | Required | Persistence       | Notes                                                                                   |
| ----------------------- | ------------ | -------- | ----------------- | --------------------------------------------------------------------------------------- |
| `profilePhotoObjectKey` | Master CV    | No       | `null` when empty | Object key of the current Master CV photo.                                              |
| `profilePhotoPositionX` | Master CV    | No       | `null` when empty | Integer percentage from `0` to `100`; horizontal position inside the square cover crop. |
| `profilePhotoPositionY` | Master CV    | No       | `null` when empty | Integer percentage from `0` to `100`; vertical position inside the square cover crop.   |
| `profilePhotoObjectKey` | Optimized CV | No       | `null` when empty | Object key of the generation-time snapshot copy. Independent of later Master CV edits.  |
| `profilePhotoPositionX` | Optimized CV | No       | `null` when empty | Generation-time horizontal position snapshot.                                           |
| `profilePhotoPositionY` | Optimized CV | No       | `null` when empty | Generation-time vertical position snapshot.                                             |
| `avatar`                | User         | No       | Unchanged         | Google profile picture. Not a CV photo.                                                 |

The two position values form one normalized focal position:

- `0, 0` is the leading/top position.
- `50, 50` is centered and is the default for a new or legacy photo.
- `100, 100` is the trailing/bottom position.
- Position values are renderer-independent percentages, not source-image pixels.

PostgreSQL stores only the object key and positioning metadata.

PostgreSQL must not store:

- A public `https` bucket URL
- A signed URL
- Image bytes
- A generated crop rectangle in source pixels
- A second cropped-image object
- `User.avatar`
- A client-supplied user ID

API responses may expose photo presence, a server-owned asset identifier sufficient for the authenticated read endpoints, and validated positioning metadata. API responses must not expose a public object URL.

The photo fields are a single configuration:

- When `profilePhotoObjectKey` is `null`, both position fields are `null`.
- When `profilePhotoObjectKey` is present, both position fields are present and within `0` to `100`.
- The public Master CV and Optimized CV shapes expose `profilePhotoAssetId`, `profilePhotoPositionX`, and `profilePhotoPositionY`.
- Position fields are not part of `MasterCvInput` text persistence and are not part of the AI extraction contract.

The public JSON must not include a `photo` field inside the AI extraction contract.

Optional Master CV fields become:

- Professional Title
- Profile Photo
- Phone
- Location
- LinkedIn
- Website
- Education
- Languages
- Certifications
- Personal Projects

Required Master CV fields are unchanged.

Only one Master CV exists per authenticated user.

Only one current Master CV photo exists per Master CV.

---

# Migration Strategy

Add nullable `profilePhotoObjectKey`, `profilePhotoPositionX`, and `profilePhotoPositionY` to Master CV storage and Optimized CV storage.

Do not backfill photo assets from:

- `User.avatar`
- Uploaded CV PDFs
- Experience, Education, or any other field
- Existing Optimized CV content or unrelated fields
- Firebase Storage objects

After migration:

- Existing Master CV and Optimized CV rows without a photo have all three photo configuration fields as `null`.
- Any existing row with a valid photo object key receives the centered position `50, 50`.
- Existing Optimized CV rows without a photo remain snapshots with no photo.
- Export of those documents omits the photo region.
- An API image rollback still runs against the new nullable columns. Do not make the columns required.

If the existing profile-photo migration has already been deployed, add a new additive migration for the position columns and centered backfill. Do not modify a deployed migration. If it has not been deployed, the position columns may be added to the pending profile-photo migration before deployment.

## Storage provider

This specification replaces the previously specified Firebase Storage provider with one private Railway Bucket.

- Object-key layout is unchanged.
- PostgreSQL continues to store object keys and photo positioning metadata only.
- `FIREBASE_STORAGE_BUCKET` is not a Career Copilot environment variable.
- V1 does not copy objects from Firebase Storage into the Railway Bucket.
- A `profilePhotoObjectKey` is valid only when that object exists in the Railway Bucket under the same key.
- If a previous implementation wrote photo objects to Firebase Storage, treat those PostgreSQL keys as empty (`null`) unless the objects are copied to the Railway Bucket under the same keys before cutover.
- If Firebase Storage was never used in production, existing rows stay `null` and no object copy is required.
- Firebase Authentication is unchanged.

---

# Storage and Object-Key Strategy

Use one private Railway Bucket.

Railway Buckets are S3-compatible object storage in the same Railway project as Web, API, and PostgreSQL. Objects are private. Public buckets are not supported.

Objects are never public.

The browser never reads or writes the bucket directly.

The API writes, copies, reads, and deletes objects with an S3-compatible client and server-only bucket credentials.

Firebase Authentication and Firebase Admin remain for Google sign-in and identity-token verification. They are not used for CV photo storage. Do not initialize Firebase Admin with a Storage bucket. Do not use `FIREBASE_STORAGE_BUCKET`.

The API container has no persistent volume. Photo files may be written only to a temporary directory during validation and upload, then deleted. They must not remain on the API disk. PostgreSQL must not store image bytes.

## Key layout

Keys are derived on the server from the session user and, for snapshots, the owned application.

Master CV current photo:

```
users/{userId}/master-cv/profile-photo/{assetId}
```

Optimized CV snapshot:

```
users/{userId}/applications/{applicationId}/optimized-cv/profile-photo/{assetId}
```

`userId` is Career Copilot `User.id` (UUID). It is not `googleSub`, not Firebase Auth `uid`, and not a client-supplied identifier.

`applicationId` is the owned Application id.

`assetId` is a server-generated UUID. Each write or copy creates a new `assetId`.

Do not use a stable overwriteable path such as `profiles/{uid}/profile-photo`.

A snapshot must never share the Master CV object key. Snapshot creation always copies to a new key.

## Bucket access

The Railway Bucket is private. Only authenticated S3 API calls with the bucket credentials can read or write objects.

Only the Career Copilot API may access objects.

Do not:

- Make objects publicly readable
- Configure bucket CORS for the frontend origin
- Add bucket credentials to the Web service
- Add a frontend bucket environment variable (`VITE_` or otherwise)
- Return public object URLs or long-lived signed download URLs
- Use Firebase Storage rules, `FIREBASE_STORAGE_BUCKET`, or a frontend Firebase Storage SDK

## Environment variables

The API receives Railway Bucket credentials as server-only environment variables. These values come from the Bucket's Credentials tab, or from Railway Variable References on the API service.

| Variable            | Classification             | Source                      | Purpose                                                     |
| ------------------- | -------------------------- | --------------------------- | ----------------------------------------------------------- |
| `BUCKET`            | SERVER-ONLY (not a secret) | Railway `BUCKET`            | S3 bucket name. Use this value, not `RAILWAY_BUCKET_NAME`.  |
| `ENDPOINT`          | SERVER-ONLY (not a secret) | Railway `ENDPOINT`          | S3 API endpoint, for example `https://storage.railway.app`. |
| `REGION`            | SERVER-ONLY (not a secret) | Railway `REGION`            | S3 region, for example `auto`.                              |
| `ACCESS_KEY_ID`     | SERVER-ONLY / SECRET       | Railway `ACCESS_KEY_ID`     | S3 access key.                                              |
| `SECRET_ACCESS_KEY` | SERVER-ONLY / SECRET       | Railway `SECRET_ACCESS_KEY` | S3 secret key.                                              |

Do not add `VITE_BUCKET`, `VITE_ENDPOINT`, `VITE_ACCESS_KEY_ID`, `VITE_SECRET_ACCESS_KEY`, or `FIREBASE_STORAGE_BUCKET`.

Do not inject bucket credentials into the Web service.

Firebase Admin continues to use `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT` for identity-token verification only.

Local development copies the same five values into the ignored API `.env`. Production injects them into the Railway API service from the Bucket.

Each Railway environment has its own bucket instance and credentials. Do not point a non-production API at the production bucket.

Railway AWS SDK credential-injection presets or `railway bucket credentials` may expose the same values under `AWS_*` names. The API must still receive the five values in the table. Do not add frontend aliases.

---

# API Responsibilities and Security

## Existing routes unchanged

```
GET    /api/master-cv
POST   /api/master-cv
PUT    /api/master-cv
POST   /api/master-cv/upload
```

`POST /api/master-cv/upload` remains PDF extraction only. It must not extract, store, or return a photo.

`GET`, `POST`, and `PUT` Master CV JSON must not accept image bytes or a client-supplied object key as a way to set the photo.

`PUT /api/applications/:id/optimized-cv` must not accept a client-supplied object path. It may persist a round-tripped server-assigned snapshot identifier only after the API verifies that the identifier belongs to `users/{sessionUserId}/applications/{applicationId}/optimized-cv/profile-photo/`.

## New routes

```
PUT    /api/master-cv/photo
PATCH  /api/master-cv/photo
DELETE /api/master-cv/photo
GET    /api/master-cv/photo
GET    /api/applications/:id/optimized-cv/photo
```

All of these routes require the application session.

`PUT /api/master-cv/photo`

- Uploads or replaces the Master CV photo.
- Multipart file field name: `file`.
- Optional multipart fields: `positionX` and `positionY`.
- Position fields must be supplied together. When both are omitted, use `50, 50`.
- Validates the file on the server.
- Writes a new Master CV object key with the S3-compatible client.
- Stores that key and the validated position on the Master CV in one database update.
- Deletes the previous Master CV object after the new key is persisted.
- Does not modify any Optimized CV.

`PATCH /api/master-cv/photo`

- Updates the position of the current Master CV photo without uploading or rewriting image bytes.
- Accepts JSON `{ "positionX": number, "positionY": number }`.
- Requires both values.
- Rejects the request when the Master CV has no photo.
- Updates only the Master CV position metadata.
- Does not modify any Optimized CV row or snapshot object.

`DELETE /api/master-cv/photo`

- Sets Master CV object key and both position fields to `null` in one database update.
- Deletes the Master CV object.
- Does not modify any Optimized CV.

`GET /api/master-cv/photo`

- Returns the current Master CV photo bytes to the owning user.
- If the Master CV has no photo, respond not found.
- Sets `Content-Type` from the detected image type, not from the client.

Master CV JSON responses provide the current position metadata alongside `profilePhotoAssetId`. Photo bytes remain available only through the authenticated photo endpoint.

`GET /api/applications/:id/optimized-cv/photo`

- Returns snapshot bytes for an Optimized CV owned by the session user.
- Without an asset identifier, return the saved Optimized CV snapshot.
- With the server-assigned asset identifier from a generated document, return that application snapshot object so an unsaved generated preview can show the new snapshot rather than a previously saved one.
- The API reconstructs the object key from the session user, the route application id, and the asset identifier. It must ignore any client-supplied object path.
- If the snapshot is empty, respond not found.

Optimized CV JSON responses provide the generation-time position snapshot alongside `profilePhotoAssetId`. The photo byte endpoint continues to return bytes only.

Do not add a Cover Letter photo route.

## Security rules

- Authentication required.
- The API obtains the user from the session cookie.
- Never trust client `userId`, `googleSub`, Firebase `uid`, or object paths.
- Users can only read or modify their own Master CV photo.
- Users can only read snapshot photos for applications they own.
- Frontend validation is UX only. The API enforces type, size, and magic bytes.
- The API validates that both position values are integers from `0` through `100`.
- The API rejects partial, non-numeric, non-integer, or out-of-range position input.
- Do not trust `Content-Type` alone.
- Do not return public object URLs or long-lived signed download URLs.
- Do not log image bytes, object keys alongside other personal data in a way that creates a new PII channel, or authentication tokens.
- Secrets stay on the server. The frontend does not receive Railway Bucket credentials, S3 access keys, or a bucket write capability.

## Failure handling

If the bucket write succeeds and the database update of the new key and position fails, delete the newly written object.

If the database write succeeds and deletion of a replaced Master CV object fails, the new key remains the source of truth. The previous Master CV object is an orphan and should be deleted on a best-effort retry during that request. Do not roll back the new photo.

If snapshot copy fails during Optimized CV generation, generation fails. Do not save a document that points at a missing snapshot. Do not fall back to `User.avatar` or to the live Master CV key.

If authenticated Preview cannot load bytes for a snapshot that has an asset identifier, it must omit the photo sibling and show a recoverable error outside the document preview. It must not leave a broken image or reserved square in the document.

If Export cannot load bytes for a saved snapshot that has an asset identifier, PDF generation fails. It must not generate a PDF that silently omits a configured photo and therefore differs from the reviewed document.

If a position-only save fails, the stored Master CV position remains unchanged. The editor shows the localized position-save failure, retains the local draft position for retry, and allows the user to return to the last saved position.

If a replacement upload fails, the existing stored photo asset and position remain unchanged. The selected local file and draft position may remain available for retry, but must not be presented as saved.

---

# Validation Rules

Frontend and backend apply the same rules. Backend enforcement is mandatory.

| Rule                                 | Value                                                     |
| ------------------------------------ | --------------------------------------------------------- |
| Presence                             | Optional                                                  |
| Allowed types                        | JPEG, PNG, WEBP                                           |
| Maximum size                         | 2 MB                                                      |
| Empty file                           | Rejected                                                  |
| SVG, GIF, HEIC, PDF, and other types | Rejected                                                  |
| Square pixel dimensions              | Not required. Presentation is square with cover cropping. |
| Minimum dimensions                   | Not required in V1                                        |
| Position values                      | Two integers, `0` through `100`, supplied together        |
| Default position                     | `50, 50`                                                  |
| Cropped derivative                   | Never created                                             |
| `User.avatar`                        | Must not be validated or stored as the CV photo           |

Detection:

- Reject by declared MIME type when it is not `image/jpeg`, `image/png`, or `image/webp`.
- Also reject when magic bytes do not match JPEG, PNG, or WEBP, even if the MIME type looks valid.

Size:

- Count the uploaded file bytes.
- Maximum 2 MB (`2 * 1024 * 1024`).
- Reuse the existing upload error pattern: invalid type and file too large return a 400 with the locale message.

The Master CV remains valid with no photo.

Invalid photos must not be saved.

Invalid positioning metadata must not change the stored photo asset or its current position.

---

# Master CV → Optimized CV Snapshot Behavior

Personal Information copy already includes `fullName`, `professionalTitle`, `email`, `phone`, `location`, `linkedin`, and `website`.

This feature adds the photo asset and position snapshot to that integrity copy.

## Generate

When an Optimized CV is generated:

1. Read the current Master CV photo key.
2. If the key is `null`, the Optimized CV asset identifier and both position values are `null`.
3. If the key is present, read its validated Master CV position and copy the bucket object to a new immutable application key.
4. Assign the new key and the same position values to the generated Optimized CV.
5. Do not point the Optimized CV at the Master CV key.
6. Do not read the Master CV position again when previewing, saving, reopening, or exporting that generated Optimized CV.

The AI must not invent, omit, replace, or describe the photo.

The extraction JSON remains without a photo field.

## Save Optimized CV

Saving persists the asset and position snapshot established at generation, or the snapshot already saved for that application when the user is editing a loaded document.

Saving must not:

- Copy the latest Master CV photo
- Read the latest Master CV photo position
- Use `User.avatar`
- Accept an object path invented by the client
- Modify the Master CV photo

If the generated document's snapshot identifier is `null`, save stores `null` for the identifier and both position fields, and the previously saved snapshot object for that application becomes unreferenced.

If the generated document has a snapshot identifier, save round-trips the generation-time position returned with that server-issued snapshot. The API validates identifier ownership, position bounds, and that the asset identifier and both position fields are present together. It does not read or copy the current Master CV photo or position during save. The client does not expose controls for changing Optimized CV photo position.

## Isolation

The following must not rewrite existing Optimized CV rows or their snapshot objects:

- Uploading a Master CV photo
- Repositioning a Master CV photo
- Replacing a Master CV photo
- Removing a Master CV photo
- Saving Master CV text fields

Reopening an Application Workspace restores the saved Optimized CV, including its photo asset, position snapshot, or empty state.

Regenerating an Optimized CV creates a new asset and position snapshot from the current Master CV. Saving that generated document replaces the previously saved Optimized CV and its snapshot.

---

# Preview and PDF Rendering

Extend the shared Optimized CV header model with optional photo presence and normalized position.

The identity content order from the Personal Information specification does not change:

1. Full name
2. Professional title when present
3. Phone + Email row
4. Location + LinkedIn row
5. Website row

The header is a horizontal row:

- Identity block: grows to use remaining width. Same content order as today.
- Photo sibling: a fixed-size square at the trailing edge of the header (right in LTR). Rendered only when the Optimized CV snapshot has a photo.

Preview and PDF must use the same presence rule, the same sibling order, the same square cover cropping, and exactly the same position percentages. They cannot share document components, but they must share the header model so structure cannot diverge.

## Presence

If the Optimized CV snapshot key is `null`, omit the photo region completely.

Do not render:

- An empty box
- A spacer column
- A reserved square
- A placeholder silhouette
- `User.avatar`
- "No photo" text in the document

When omitted, the identity block occupies the full header width.

When the snapshot contains an asset identifier but authenticated photo bytes are still loading, Preview temporarily omits the photo sibling and lets the identity block use the full width. Once bytes load, Preview renders the configured sibling. If loading fails, Preview continues to omit the sibling and reports the failure outside the document.

PDF has no loading state. When a configured snapshot object cannot be read, PDF generation fails rather than emitting a document with a different photo presence rule.

## Presentation

When the snapshot is present:

- Render a square.
- Use cover/cropping behavior: the image fills the square and is cropped at the saved position as needed. Do not stretch.
- Use `112` CSS pixels in Preview, the 96-DPI CSS equivalent of the correct `84`-point PDF size.
- Keep the photo at the trailing/right side of the header.
- Keep the PDF trailing inset at `16` points. Use its `21.333` CSS pixel equivalent plus a Preview-only `4` CSS pixel left shift, for a `25.333` CSS pixel Preview trailing inset.
- Apply one subtle alpha fade to the outer edge of the photo container in Preview and PDF. Preview tuning is the visual source of truth; PDF-specific mask geometry must compensate for the different CSS and SVG/Sharp radial-gradient coordinate systems.
- Do not place a color or gradient overlay on top of the image. The edge mask must not add blur, shadow, border, frame, rounded corners, or decorative treatment.
- Preserve the existing identity block, identity content order, and identity-to-photo separation.
- Use `profilePhotoPositionX` and `profilePhotoPositionY` directly as percentage-based object-position values.
- Use `50, 50` for centered legacy or newly selected photos until the user changes the position.
- Master CV provides the positioning controls. Optimized CV, Export Preview, and PDF are read-only.
- Do not add a third-party crop editor.
- Store the original validated image. Cropping is a render-time presentation rule.
- Do not write a cropped derivative to the bucket or database.
- Preview and PDF use equivalent physical square size and container-edge alpha treatment, plus the same normalized position and compatibility defaults defined in the shared header model. The additional `4` CSS pixel Preview shift is layout-only and must not change the normalized position or PDF layout.

Browser Preview uses `object-fit: cover` and percentage `object-position`, with a radial alpha mask applied to the photo container. The image element receives no color, opacity, background, or gradient treatment.

PDF applies the same radial alpha appearance to a temporary, render-only square PNG after resolving the existing cover crop at the saved `objectPositionX` and `objectPositionY`. Because CSS `circle closest-side` percentages are based on half the square while the PDF mask must cover its diagonal, PDF normalizes Preview stops by `sqrt(2)` and uses a `70.711%` SVG radius. React-PDF receives that masked image without placing a gradient overlay above it. The temporary render buffer is not stored and does not modify the bucket object or persisted positioning.

Use non-square image fixtures to verify that horizontal and vertical positions produce equivalent framing in Preview and PDF.

## Bytes

Preview:

- The browser requests photo bytes from the authenticated API photo endpoints with the session cookie.
- Export preview of a saved Optimized CV uses the saved snapshot endpoint, not `GET /api/master-cv/photo`.
- An unsaved generated Optimized CV preview uses the snapshot created at generation, not the live Master CV photo and not a previously saved snapshot for that application.
- Authenticated object URLs created for photo previews must be revoked when the source changes, when a replacement is applied, and when the component unmounts.

PDF:

- The backend document renderer loads snapshot bytes with the S3-compatible client.
- Pass those bytes into the PDF image. Do not let the renderer fetch a bucket URL or signed URL.
- PDFs remain temporary renderings. They are never stored.
- If the PDF renderer cannot embed WEBP directly, convert snapshot bytes at render time. Do not reject WEBP uploads.

Cover Letter preview and PDF remain:

- Candidate name
- Email and phone on one line, omitted independently when empty
- Date
- Company name when present

No photo, professional title, location, LinkedIn, website, or contact icons.

---

# Replace, Remove, and Orphan Objects

Because snapshots are copies, Master CV objects and Optimized CV objects never share a key.

## Replace Master CV photo

1. Validate and write the original new Master CV object.
2. Validate the selected position, defaulting to `50, 50` when omitted.
3. Persist the new key and selected position on the Master CV atomically.
4. Delete the previous Master CV object.
5. Leave every Optimized CV asset and position snapshot untouched.

## Reposition Master CV photo

1. Validate the requested position.
2. Persist only the two position fields on the Master CV.
3. Do not rewrite, copy, transform, or delete the Master CV photo object.
4. Leave every Optimized CV asset and position snapshot untouched.

## Remove Master CV photo

1. Persist `null` for the Master CV object key and both position fields atomically.
2. Delete the Master CV object.
3. Leave every Optimized CV asset and position snapshot untouched.

## Replace saved Optimized CV

When a newer Optimized CV is saved for the same application:

1. Persist the new asset key and position snapshot, or `null` for all three fields.
2. Delete the previously saved snapshot object for that application if it is no longer referenced.

The position fields cannot survive without an asset key, and an asset key cannot be saved without both position fields.

## Abandoned generate copies

If the user generates more than once without saving, the API may delete the previous unsaved snapshot copy for that application when creating the newer copy.

Generating must not delete a still-saved snapshot until the newer document is saved.

## Delete Application

Deleting an Application deletes its Optimized CV snapshot object.

It must not delete the Master CV photo.

## Failed or interrupted uploads

Delete any object that is not referenced by Master CV or Optimized CV storage after a failed request.

## Account deletion

There is no account-deletion flow. Bulk deletion of a user's bucket objects is out of scope.

---

# Functional Requirements

- The Master CV stores an optional profile photo object key.
- The Master CV stores optional normalized horizontal and vertical photo position metadata.
- The user can upload, drag-to-position, reposition, replace, and remove that photo from the Master CV editor.
- Allowed files are JPEG, PNG, and WEBP, maximum 2 MB.
- The API validates the file and writes it to a private Railway Bucket with an S3-compatible client.
- PostgreSQL stores an object key, never a public URL.
- Object keys use server-derived `User.id` and application ownership.
- `User.avatar` is never used as the CV photo.
- Uploaded CV extraction does not extract or attach a photo.
- The AI does not analyze, generate, crop, or describe the photo.
- Positioning changes only render-time presentation metadata. They do not create cropped image objects.
- Optimized CV generation copies the current Master CV photo to an immutable snapshot object and copies its saved position, or stores `null` for the complete photo configuration.
- Optimized CV photo is read-only.
- There is no per-application photo picker.
- Preview and PDF read only the Optimized CV asset and position snapshot.
- Preview and PDF use exactly the same normalized position.
- Empty photo omits the photo region and reserves no space.
- Present photo renders as a square with cover cropping.
- Present photo renders at `84` square points with a `16`-point trailing inset in PDF and at the equivalent `112` CSS pixels with a `25.333` CSS pixel trailing inset in Preview, including its Preview-only `4` CSS pixel left shift. Both use the same subtle perimeter vignette.
- Master CV photo upload, reposition, replace, and remove actions do not modify existing Optimized CVs.
- Saving an Optimized CV does not refresh the photo from the Master CV.
- Cover Letter preview and PDF remain unchanged.
- Existing application workflow behavior remains unchanged except for the photo data flow defined here.

---

# Business Rules

## Presence

A photo is empty when `profilePhotoObjectKey` is `null`.

Empty photo persists as `null` for the object key and both position fields.

Empty photo must disappear completely from Optimized CV preview and PDF.

## Ownership and Integrity

- Master CV remains the single source of truth for the current photo.
- Master CV remains the single source of truth for the current photo position.
- Optimized CV photo asset and position are snapshots copied at generation time.
- Users cannot edit the photo inside the Optimized CV.
- Saving an Optimized CV must not modify the Master CV.
- Saving the Master CV must not modify existing Optimized CVs.
- Export must not modify Master CV, Optimized CV, Cover Letter, or Application data.
- Export must not read the Master CV photo to fill the Optimized CV.
- Export must not read the Master CV photo position to fill the Optimized CV.

## Identity Split

`User.avatar` is account chrome for the Profile page.

The CV photo is Master CV Personal Information.

These values must never be copied into each other in V1.

---

# UI Requirements

## Master CV Personal Information Form

- Keep the existing Personal Information section.
- Add an optional Profile photo control as the first item, before Full name.
- Empty state: upload control and helper text. No document-style empty photo box.
- Selected or present state: square cover-cropped preview using the current position.
- The user can drag the image inside the square to position it.
- Do not expose numeric/manual horizontal or vertical controls or a Center action.
- Place the existing photo's Save position, Replace, and Remove actions vertically beside the drag area on larger screens and responsively below it on smaller screens.
- Replacement: position locally before applying the original file and position together.
- Do not show `User.avatar` in this control.
- Do not show document header icons in the form.
- Photo actions are separate from the Master CV text Save button once a Master CV exists.

## Optimized CV Header

- Render the photo sibling only when the Optimized CV snapshot is present.
- Keep identity content order unchanged.
- Keep the photo and its position read-only.
- Do not expose upload, replace, or remove controls.

## Cover Letter Header

Unchanged. No photo.

---

# Internationalization

Use the existing English, Spanish, and French message catalogs.

English:

| Key purpose           | English                                        |
| --------------------- | ---------------------------------------------- |
| Profile photo label   | Profile photo                                  |
| Helper text           | Optional. JPEG, PNG, or WEBP. Maximum 2 MB.    |
| Upload action         | Upload photo                                   |
| Replace action        | Replace photo                                  |
| Remove action         | Remove photo                                   |
| Invalid type          | Only JPEG, PNG, and WEBP images are supported. |
| File too large        | Maximum file size is 2 MB.                     |
| Upload failure        | The photo could not be uploaded.               |
| Remove failure        | The photo could not be removed.                |
| Drag instruction      | Drag the photo to position it.                 |
| Horizontal position   | Horizontal position                            |
| Vertical position     | Vertical position                              |
| Center action         | Center photo                                   |
| Apply action          | Apply photo                                    |
| Save position action  | Save position                                  |
| Position save failure | The photo position could not be saved.         |
| Onboarding retry      | Retry photo upload                             |

Spanish:

| Key purpose           | Spanish                                    |
| --------------------- | ------------------------------------------ |
| Profile photo label   | Foto de perfil                             |
| Helper text           | Opcional. JPEG, PNG o WEBP. Máximo 2 MB.   |
| Upload action         | Subir foto                                 |
| Replace action        | Reemplazar foto                            |
| Remove action         | Quitar foto                                |
| Invalid type          | Solo se admiten imágenes JPEG, PNG y WEBP. |
| File too large        | El tamaño máximo del archivo es 2 MB.      |
| Upload failure        | No se pudo subir la foto.                  |
| Remove failure        | No se pudo quitar la foto.                 |
| Drag instruction      | Arrastra la foto para posicionarla.        |
| Horizontal position   | Posición horizontal                        |
| Vertical position     | Posición vertical                          |
| Center action         | Centrar foto                               |
| Apply action          | Aplicar foto                               |
| Save position action  | Guardar posición                           |
| Position save failure | No se pudo guardar la posición de la foto. |
| Onboarding retry      | Reintentar la subida de la foto            |

French:

| Key purpose           | French                                                     |
| --------------------- | ---------------------------------------------------------- |
| Profile photo label   | Photo de profil                                            |
| Helper text           | Facultatif. JPEG, PNG ou WEBP. Maximum 2 Mo.               |
| Upload action         | Téléverser une photo                                       |
| Replace action        | Remplacer la photo                                         |
| Remove action         | Retirer la photo                                           |
| Invalid type          | Seules les images JPEG, PNG et WEBP sont prises en charge. |
| File too large        | La taille maximale du fichier est de 2 Mo.                 |
| Upload failure        | La photo n'a pas pu être téléversée.                       |
| Remove failure        | La photo n'a pas pu être retirée.                          |
| Drag instruction      | Faites glisser la photo pour la positionner.               |
| Horizontal position   | Position horizontale                                       |
| Vertical position     | Position verticale                                         |
| Center action         | Centrer la photo                                           |
| Apply action          | Appliquer la photo                                         |
| Save position action  | Enregistrer la position                                    |
| Position save failure | La position de la photo n'a pas pu être enregistrée.       |
| Onboarding retry      | Réessayer de téléverser la photo                           |

Document `alt` text uses the candidate full name when present. It must not use `User.avatar` or a Google account name that is not the Master CV `fullName`.

---

# Technical Notes

- Reuse existing Master CV, Optimized CV, Export, and authentication architecture.
- Reuse the Master CV PDF upload pattern: authenticated multipart to the API, temporary disk file, server validation, delete temp file.
- Reuse `enforceMasterCvIntegrity` to attach the snapshot identifier. Extend it so the Optimized CV cannot keep an AI-invented or client-invented photo reference.
- Extend integrity handling to attach the generation-time position with the snapshot identifier.
- Reuse the shared header model in web and API so preview and PDF cannot diverge on presence, size, vignette, default position, or object-position values. Keep the explicit Preview-only `4` CSS pixel layout shift separate from persisted positioning and PDF layout.
- Reuse existing optional-value persistence (`null` when empty).
- Use a server-only S3-compatible client against one private Railway Bucket. Do not add frontend bucket environment variables in V1.
- Inject Railway Bucket credentials only into the API service.
- Do not initialize Firebase Admin for object storage. Firebase Admin remains for identity-token verification only.
- Do not introduce a frontend S3 SDK or Firebase Storage SDK.
- Do not introduce signed upload or download URLs.
- Do not introduce an image-processing dependency unless PDF rendering cannot embed WEBP without a conversion step.
- Do not use `sharp` or another image processor to create or store persistent positioned crop derivatives. Temporary in-memory PDF conversion and container-edge alpha masking remain allowed render-time concerns.
- Implement direct drag positioning with browser pointer events. Do not add a crop-editor dependency or expose separate manual position controls.
- Revoke authenticated image object URLs on source change, replacement, and unmount.
- Preserve photo asset and position state when imported Master CV text remounts or replaces text form values.
- Report deferred onboarding photo upload failures and support retry after the Master CV text has already been created.
- After approval, keep deployment environment documentation aligned with the Railway Bucket variables in this specification.

---

# AI Considerations

AI is not involved in photo upload, validation, storage, cropping, or rendering.

Extraction must not add a photo field.

Optimized CV generation must not send photo bytes to the model and must not receive a photo field back.

Unknown Personal Information values remain `null`. Never invent a photo.

Token optimization: do not add photo-related fields to the extraction contract.

---

# Tests

Update:

- Header tests that currently assert the markup does not contain `data-cv-header-photo`. Empty snapshot remains that assertion. Present snapshot asserts the photo sibling.
- Master CV optional-field lists and i18n key lists
- Optimized CV integrity copying for both asset and position
- Export preview/PDF structural tests
- Application delete tests, if they already assert related cleanup

Add:

- Migration: existing empty rows have `null` photo keys and position values
- Migration: existing rows with a photo key receive centered `50, 50` positioning
- Upload accepts JPEG, PNG, and WEBP at or under 2 MB
- Upload accepts valid paired position metadata and defaults omitted position to `50, 50`
- Upload and position update reject partial, non-numeric, non-integer, and out-of-range position values
- Upload rejects GIF, SVG, HEIC, PDF, empty files, files over 2 MB, and MIME/magic-byte mismatches
- Upload, reposition, replace, and remove require authentication and use the session user
- A request cannot write or read another user's photo by supplying a user ID or object path
- PostgreSQL stores an object key, not a public URL
- Photo responses are authenticated bytes from the API, not public or signed bucket URLs
- The API uses Railway Bucket credentials. It does not require `FIREBASE_STORAGE_BUCKET`.
- `User.avatar` is never copied onto Master CV or Optimized CV
- Extraction response and schema have no photo field
- Reposition updates Master CV metadata without rewriting the bucket object
- Generate with a Master CV photo creates a new snapshot key different from the Master CV key and copies the exact saved position
- Generate with no Master CV photo stores `null` for the complete Optimized CV photo configuration
- Repositioning, replacing, or removing the Master CV photo does not change a generated or saved Optimized CV asset or position snapshot
- Saving Optimized CV edits does not refresh the photo asset or position from the Master CV
- Regenerating and saving an Optimized CV replaces the previous asset and position snapshot
- Empty snapshot omits `data-cv-header-photo` in preview and PDF and reserves no space
- Present snapshot renders an `84`-point square cover-cropped sibling with a `16`-point trailing inset in PDF and the equivalent `112` CSS pixel square with a `25.333` CSS pixel inset in Preview, including the Preview-only `4` CSS pixel left shift; both render the subtle perimeter vignette
- Non-square landscape and portrait fixtures verify leading, centered, and trailing horizontal positions in Preview and PDF
- Non-square fixtures verify top, centered, and bottom vertical positions in Preview and PDF
- Preview and PDF consume the same position values without renderer-specific inversion or rounding
- Preview omits the photo region while bytes are unavailable and reports a load failure outside the document
- PDF export fails rather than silently omitting a configured but unreadable snapshot object
- Export preview and PDF do not read the live Master CV photo
- Cover Letter fixtures remain without a photo
- Replace deletes the previous Master CV object and leaves snapshot objects
- Application delete deletes the snapshot object and leaves the Master CV photo
- `GET` photo endpoints return not found when empty and forbidden or not found for another user's resource
- Importing Master CV text preserves the current photo asset identifier and position in editor state
- Deferred onboarding photo upload failures are visible and retryable after Master CV text creation
- Authenticated preview object URLs are revoked on source change, replacement, and unmount
- Client profile-photo validation and Master CV upload/replace/reposition/remove interactions have focused Web unit coverage
- WEBP-to-PDF conversion remains covered independently from focal positioning

This specification does not introduce browser end-to-end tests. Use existing document-rendering tests and Optimized CV preview markup tests.

---

# Acceptance Criteria

### AC1 — Optional Master CV photo

Given a user is editing a saved Master CV

When they upload a valid JPEG, PNG, or WEBP image of at most 2 MB

Then the API stores the file in the private Railway Bucket

And PostgreSQL stores the object key and a valid position on the Master CV

And the editor shows a square cover-cropped preview at that position.

### AC2 — Empty photo is valid

Given a user never uploads a photo

When they save the Master CV

Then `profilePhotoObjectKey` is `null`

And both photo position fields are `null`

And the Master CV remains valid.

### AC3 — Replace Master CV photo

Given a Master CV with a photo

When the user uploads a new valid photo

Then the user can position the new photo before applying it

And the Master CV points at the new object and selected position

And the previous Master CV object is deleted

And existing Optimized CVs still show their previous asset and position snapshot, if any.

### AC4 — Remove Master CV photo

Given a Master CV with a photo

When the user removes the photo

Then the Master CV key is `null`

And both Master CV position fields are `null`

And the Master CV object is deleted

And existing Optimized CVs still show their previous asset and position snapshot, if any.

### AC5 — Rejected files

Given a user selects a GIF, SVG, HEIC, PDF, empty file, or a file larger than 2 MB

When they upload it as the profile photo

Then the API rejects the file

And the stored Master CV photo is unchanged.

### AC6 — Google avatar is not the CV photo

Given a user whose Google account has an avatar

When they open the Master CV editor, Optimized CV, or Export

Then `User.avatar` is not used as the CV photo

And the Profile page avatar behavior is unchanged.

### AC7 — No extraction of photos

Given a user uploads a CV PDF that contains a portrait

When extraction completes

Then no photo is stored or returned

And the Personal Information extraction object still has no photo field.

### AC8 — Snapshot copy on generate

Given a Master CV with a photo

When an Optimized CV is generated

Then the Optimized CV stores a different object key than the Master CV

And that key is a copy under the owned application prefix

And the Optimized CV stores the Master CV position that existed at generation time.

### AC9 — Empty snapshot on generate

Given a Master CV with no photo

When an Optimized CV is generated

Then the Optimized CV snapshot is `null`

And its position snapshot is `null`

And preview and PDF omit the photo region.

### AC10 — Isolation from later Master CV changes

Given a saved Optimized CV whose snapshot contains a photo and saved position

And the user later repositions, replaces, or removes the Master CV photo

When they reopen or export that Optimized CV without generating a new one

Then the document still uses the original snapshot

And it still uses the generation-time position

And it does not use the live Master CV photo or position.

### AC11 — Save Optimized CV does not refresh the photo

Given a generated Optimized CV asset and position snapshot

And a later change to the Master CV photo or position before save

When the user saves that generated Optimized CV without regenerating

Then the saved snapshot remains the generation-time copy

And it is not replaced by the latest Master CV photo or position.

### AC12 — Preview matches PDF

Given any saved Optimized CV with or without a photo snapshot

When the user views Export preview and downloads the Optimized CV PDF

Then both use the same photo presence rule, equivalent `84`-point/`112`-CSS-pixel square cover presentation, the same subtle perimeter vignette, header sibling order, and exact normalized position
And PDF keeps its `16`-point trailing inset while Preview uses `25.333` CSS pixels, including the Preview-only `4` CSS pixel left shift.

### AC13 — Empty photo occupies no space

Given an Optimized CV snapshot with no photo

When preview or PDF is rendered

Then no photo region, empty box, spacer, or reserved column is present

And the identity block uses the full header width.

### AC14 — Photo is read-only on Optimized CV

Given a generated Optimized CV

When the user reviews or edits it

Then there is no upload, replace, or remove photo control

And there is no photo-position control

And changing the photo or position requires editing the Master CV and generating a new Optimized CV.

### AC15 — No per-application photo selection

Given two Application Workspaces

When the user generates an Optimized CV in each

Then each snapshot comes from the Master CV photo at that generation time

And each snapshot includes the Master CV position at that generation time

And the user cannot pick a different photo inside either application.

### AC16 — Authenticated private reads

Given a profile photo object in the Railway Bucket

When an unauthenticated client or another user requests it

Then access is denied

And the object is not publicly readable.

### AC17 — Server-derived ownership

Given an authenticated user

When they call a photo endpoint with another user's id or a client-invented object path

Then the API ignores that input and uses the session user and owned application

And it does not write or return another user's object.

### AC18 — Cover Letter unchanged

Given a saved Cover Letter

When preview or PDF is rendered

Then the header remains candidate name, email and phone, date, and company name when present

And it does not show a photo.

### AC19 — Application delete cleans up the snapshot

Given an Application with an Optimized CV photo snapshot

When the user deletes that Application

Then the snapshot object is deleted

And the Master CV photo and its current position remain.

### AC20 — Locales

Given the Master CV form in English, Spanish, or French

When the photo control is displayed

Then labels, helper text, actions, and validation messages use the locale strings defined in this specification.

### AC21 — Export does not read Master CV photo for the document body

Given a saved Optimized CV with no photo and a Master CV that later has a photo

When the user exports without generating a new Optimized CV

Then the PDF omits the photo region.

### AC22 — Position a Master CV photo

Given a user has selected or stored a Master CV photo

When they drag the image inside the square crop preview and save or apply the position

Then the preview updates without creating a cropped derivative

And PostgreSQL stores integer horizontal and vertical position percentages

And the original bucket object remains unchanged for a position-only update.

### AC23 — Simplified positioning UI

Given a user has selected or stored a Master CV photo

When the photo editor is displayed

Then horizontal and vertical manual controls and the Center action are not displayed

And Save position, Replace, and Remove remain available beside the drag area.

### AC24 — Position validation

Given a photo upload or position update has missing, partial, non-numeric, non-integer, or out-of-range position metadata

When the API validates the request

Then it rejects invalid metadata

And the stored photo asset and current position remain unchanged.

### AC25 — Header photo dimensions and spacing

Given an Optimized CV snapshot with a photo

When Preview or PDF renders the header

Then the PDF photo is an `84`-point square and the Preview photo is its `112`-CSS-pixel equivalent at the trailing/right side

And the PDF has an additional `16`-point inset while Preview uses `25.333` CSS pixels, including a Preview-only `4` CSS pixel left shift
And both render the same subtle perimeter vignette without blur, shadow, border, frame, or rounded corners

And the existing identity content order remains unchanged.

### AC26 — Non-square position parity

Given a non-square portrait or landscape photo with a non-centered saved position

When Preview and PDF render the same Optimized CV snapshot

Then both apply cover cropping without stretching

And both frame the same part of the source image using the exact saved percentages.

### AC27 — Photo loading and missing bytes

Given an Optimized CV snapshot has a photo identifier

When authenticated Preview bytes are still loading or cannot be read

Then Preview does not render a broken image or reserve the photo region

And a load failure is reported outside the document.

Given Export cannot read the configured saved snapshot object

When the user requests the PDF

Then PDF generation fails with the existing safe export error behavior

And no PDF with a silently omitted photo is returned.

### AC28 — Import preserves photo state

Given an existing Master CV has a photo and saved position

When the user imports Master CV text from a PDF

Then the editor preserves the current photo asset and position

And the import does not extract, replace, remove, or reposition the photo.

### AC29 — Onboarding photo failure is visible and retryable

Given Master CV text is created during onboarding with a pending photo

When the subsequent photo upload fails

Then the text Master CV remains saved

And the failure is shown to the user

And the user can retry the photo upload or continue without a photo.

### AC30 — Authenticated image URL lifecycle

Given Preview or the Master CV editor creates a browser object URL for authenticated photo bytes

When the source changes, a replacement is applied, or the component unmounts

Then the obsolete object URL is revoked.

### AC31 — Focused Web and visual regression coverage

Given the positioning implementation is ready for validation

When the Web and document-rendering test suites run

Then focused tests cover client validation, authenticated image cleanup, upload, replace, reposition, remove, import preservation, and onboarding retry

And non-square visual fixtures cover horizontal and vertical position parity between Preview and PDF.

---

# Implementation Phases

The implementation must be completed incrementally.

## Phase 1 — Infrastructure and data model

Private Railway Bucket, server-only S3 credentials on the API, S3-compatible client initialization, additive nullable photo key columns, and additive nullable position columns with centered compatibility backfill.

No product UI.

## Phase 2 — Master CV photo

Upload, drag-to-position, keyboard-accessible position controls, position-only update, replace, remove, authenticated Master CV photo read, editor control, validation, i18n, import state preservation, visible onboarding upload retry, authenticated object URL cleanup, and Master CV orphan-object handling.

No Optimized CV snapshot and no document photo rendering.

## Phase 3 — Optimized CV snapshot

Immutable object copy and position copy on generate, integrity rules, save isolation for both values, application-scoped authenticated snapshot read, and snapshot orphan handling.

No header photo rendering yet.

## Phase 4 — Preview and PDF

Shared header photo sibling, physically equivalent `84`-point PDF/`112`-CSS-pixel Preview square cover presentation, `16`-point PDF trailing inset, `25.333`-CSS-pixel Preview trailing inset with an explicit Preview-only `4` CSS pixel left shift, subtle perimeter vignette parity, exact normalized position parity, unified loading/presence behavior, Export preview and PDF from the asset and position snapshot, non-square visual fixtures, and Cover Letter unchanged.

## Phase 5 — Tests and residual cleanup

Complete acceptance-criterion coverage, including position validation, snapshot isolation, private access, application delete, header empty/present structure, focused Web interactions, authenticated object URL lifecycle, import preservation, onboarding retry, WEBP conversion, and non-square Preview/PDF visual regression.

Each phase must be independently testable.

No future phase should be implemented before its corresponding implementation task is approved.

Do not implement application code until this specification is approved.

---

# Out of Scope

Do not implement:

- Signed upload or download URLs
- Browser uploads directly to the Railway Bucket
- Public bucket objects or public download URLs
- Reuse of `User.avatar` as the CV photo
- Photo extraction from uploaded CVs
- AI photo analysis, generation, enhancement, or background removal
- Per-application photo selection or upload
- Third-party crop-editor dependency
- Zoom, rotation, freeform crop rectangles, or aspect-ratio selection
- Creating or storing a cropped derivative image
- Destructive modification of the original uploaded image
- Forced square pixel dimensions at upload
- Multiple photos or a photo gallery
- Cover Letter photo
- Photo on filenames
- Account-deletion bucket cleanup
- Antivirus scanning
- HEIC, GIF, SVG, BMP, TIFF, or PDF as photo types
- Client-side S3 SDK or Firebase Storage SDK
- Frontend bucket environment variables
- `FIREBASE_STORAGE_BUCKET` or Firebase Storage for CV photos
- Changing Job Analysis, Profile Match, Cover Letter generation, or Export selection/download behavior
- Updating saved Optimized CVs when the Master CV photo asset or position changes
- Backfilling photos onto existing Optimized CVs
- New icon libraries or other unrelated dependencies

---

# Related Documentation

- `docs/product/07-optimized-cv.md`
- `docs/product/09-export.md`
- `docs/specs/master-cv-onboarding.md`
- `docs/specs/master-cv-personal-information.md`
- `docs/specs/optimized-cv.md`
- `docs/specs/export.md`
- `docs/specs/cover-letter.md`
- `docs/specs/google-authentication.md`
- `docs/architecture/06-api-overview.md`
- `docs/architecture/07-security.md`
- `docs/engineering/DEPLOYMENT.md`
- `docs/engineering/AI_ENGINEERING.MD`
- `docs/engineering/PROJECT_RULES.MD`
- `docs/engineering/DEVELOPMENT_GUIDE.MD`

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
- [x] No ambiguous requirements.

---

# Amendments After Approval

After this specification is approved, and before or during implementation, keep the related specifications aligned as follows.

## Master CV Personal Information

The header photo sibling, omit-when-empty photo rule, and photo out-of-scope statements are owned by this specification.

## Master CV Onboarding

Profile photo is optional, user-uploaded, and never extracted from the PDF.

## Optimized CV

Photo asset and position are protected Master CV information snapshotted at generation.

## Export

Preview and PDF read the Optimized CV photo asset and position snapshot only.

## Cover Letter

No photo.

## Deployment and security

Document Railway Bucket credentials as server-only API environment variables. File security includes private CV photo objects. Do not document `FIREBASE_STORAGE_BUCKET`.
