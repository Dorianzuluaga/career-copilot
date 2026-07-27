Read the Workspace Rules first.

Implement Google Authentication for the MVP.

Requirements:

- Use Firebase Authentication.
- Use Google Sign In with Popup.
- Use Firebase Admin SDK on the backend to verify ID Tokens.
- Create POST /api/auth/google.
- Receive { idToken }.
- Verify the token.
- Find or create the user.
- Use Prisma for the User model.
- Create a Session model in Prisma.
- Store an opaque session ID.
- Return an HTTP-only cookie named career_copilot_session.
- Cookie:
  - HttpOnly
  - SameSite=Lax
  - Secure only in production
  - MaxAge: 7 days
- Implement GET /api/auth/me.
- Response:

{
"authenticated": true,
"user": {
"id": "...",
"name": "...",
"email": "...",
"avatar": "..."
}
}

Authentication errors:

401

{
"authenticated": false,
"message": "Authentication failed."
}

Use this exact login error message in the UI:

"Unable to sign in. Please try again."

Firebase configuration:

Frontend:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_APP_ID

Backend:

- GOOGLE_APPLICATION_CREDENTIALS

Create every file required.

Reuse existing architecture whenever possible.

When implementation is complete provide:

1. Files created.
2. Files modified.
3. Architecture decisions.
4. User flow implemented.
5. Any deviations from these requirements.
6. Remaining work.
