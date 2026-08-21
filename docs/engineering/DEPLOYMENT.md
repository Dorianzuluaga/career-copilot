# Production Deployment

This guide prepares Career Copilot for production on Railway: Web, API, and PostgreSQL.

Vercel is not part of the production deployment.

Do not commit real secrets. Do not put server secrets in `VITE_` variables.

---

## Environment variables

### Classification

| Variable                         | Classification             | Where             |
| -------------------------------- | -------------------------- | ----------------- |
| `VITE_API_URL`                   | PUBLIC / CLIENT-SAFE       | Frontend          |
| `VITE_FIREBASE_API_KEY`          | PUBLIC / CLIENT-SAFE       | Frontend          |
| `VITE_FIREBASE_AUTH_DOMAIN`      | PUBLIC / CLIENT-SAFE       | Frontend          |
| `VITE_FIREBASE_PROJECT_ID`       | PUBLIC / CLIENT-SAFE       | Frontend          |
| `VITE_FIREBASE_APP_ID`           | PUBLIC / CLIENT-SAFE       | Frontend          |
| `NODE_ENV`                       | SERVER-ONLY (not a secret) | Backend           |
| `PORT`                           | SERVER-ONLY (not a secret) | Web and API       |
| `FRONTEND_ORIGIN`                | SERVER-ONLY (not a secret) | Backend           |
| `DATABASE_URL`                   | SERVER-ONLY / SECRET       | Backend           |
| `OPENAI_API_KEY`                 | SERVER-ONLY / SECRET       | Backend           |
| `OPENAI_MODEL`                   | SERVER-ONLY (not a secret) | Backend           |
| `GOOGLE_APPLICATION_CREDENTIALS` | SERVER-ONLY / SECRET       | Backend (local)   |
| `FIREBASE_SERVICE_ACCOUNT`       | SERVER-ONLY / SECRET       | Backend (Railway) |

Frontend variables are bundled into the browser at build time. Never put OpenAI keys, database credentials, Firebase service accounts, session secrets, or provider tokens in `VITE_` variables.

Firebase web config values are public client identifiers. Restrict them in the Firebase console to the production domain. The Firebase Admin service account is a secret and must stay on the API.

### Local development

Copy the committed templates and replace placeholders in ignored `.env` files:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

Required locally:

- Frontend: `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
- Backend: `DATABASE_URL`, `OPENAI_API_KEY`, `FRONTEND_ORIGIN` (defaults to `http://localhost:5173` if omitted), and either `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT`

Optional locally:

- `PORT` (defaults to `3001` for the API and `4173` for production frontend serving)
- `OPENAI_MODEL` (defaults to `gpt-4.1-mini`)
- `NODE_ENV` (`development` for local work)

### Production frontend (Railway Web)

Set these on the Railway Web service. They are inlined at build time, so a value change requires a new Web deployment.

- `VITE_API_URL` — public Railway API origin, for example `https://your-api.up.railway.app`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Railway usually provides `PORT`. Do not use `npm run dev` on this service.

### Production backend (Railway API)

Set these on the Railway API service. Railway usually provides `PORT` and `NODE_ENV=production`.

- `DATABASE_URL` — provided when the Railway PostgreSQL service is linked. Required at build time (`prisma generate`) and at start (`prisma migrate deploy`)
- `FRONTEND_ORIGIN` — exact Railway Web origin, for example `https://your-web.up.railway.app` (no trailing path)
- `OPENAI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT` — full Firebase Admin service account JSON
- `OPENAI_MODEL` — optional

Use `FIREBASE_SERVICE_ACCOUNT` on Railway. `GOOGLE_APPLICATION_CREDENTIALS` expects a file path and is intended for local development.

---

## Local setup

Prerequisites: Node.js 22 LTS, npm, and PostgreSQL.

```bash
npm install
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

Generate the Prisma Client after `DATABASE_URL` is set:

```bash
npm run prisma:generate --workspace=api
```

Apply migrations to the local database:

```bash
npm run prisma:migrate:deploy --workspace=api
```

Start the apps in separate terminals:

```bash
npm run dev --workspace apps/web
npm run dev --workspace apps/api
```

The frontend is `http://localhost:5173`. The API is `http://localhost:3001`. The health check is `GET /health`.

To serve the compiled frontend locally the same way Railway does:

```bash
npm run build --workspace=web
npm run start --workspace=web
```

That command serves `apps/web/dist` on `PORT` (default `4173`). It never uses `npm run dev`.

---

## Production setup

### Database

1. Create a PostgreSQL service on Railway.
2. Link it to the API service so `DATABASE_URL` is injected.
3. Do not commit dumps, backups, or local database files.

### Database migration procedure

Migrations live in `apps/api/prisma/migrations`.

API start command:

```bash
npm run prisma:migrate:deploy --workspace=api && npm run start --workspace=api
```

`prisma migrate deploy` applies pending migrations only. It does not create new migration files and it does not use `prisma migrate dev`.

If a migration fails, the API process does not start. Fix the database or migration, then redeploy. Do not use `prisma migrate reset` in production.

### Railway configuration

This repository is a shared npm workspaces monorepo. Create three Railway services from the same GitHub repository:

| Service    | Role                         |
| ---------- | ---------------------------- |
| PostgreSQL | Railway PostgreSQL plugin    |
| API        | Express production server    |
| Web        | Vite production static build |

For **both** Web and API:

- Connect the GitHub repository.
- Keep the Railway Root Directory as the repository root (`/`). Do not set it to `apps/web` or `apps/api`; workspace install and build commands need the root `package.json` and lockfile.
- Node.js 22 is selected from the root `package.json` `engines` field.

Set each service's Config-as-code file path:

| Service | Config file              |
| ------- | ------------------------ |
| API     | `/apps/api/railway.json` |
| Web     | `/apps/web/railway.json` |

API (`apps/api/railway.json`):

- Builds the API, generates the Prisma Client, runs `prisma migrate deploy`, then starts `node dist/server.js`.
- Health check: `GET /health`.
- Required environment variables: see Production backend above.

Web (`apps/web/railway.json`):

- Builds the Vite production bundle with `npm run build --workspace=web`.
- Starts `npm run start --workspace=web`, which serves `apps/web/dist` with SPA fallback for React Router.
- Health check: `GET /`.
- Required environment variables: see Production frontend above.
- Never start this service with `npm run dev` or `vite`.

Generate a public HTTPS domain for both Web and API. Confirm the public API URL uses HTTPS.

The API and Web servers listen on `PORT` from the environment.

Do not hardcode Railway URLs in source. Set `VITE_API_URL` on the Web service and `FRONTEND_ORIGIN` on the API service.

If Railway's JavaScript monorepo importer sets a service Root Directory to `apps/web` or `apps/api`, change it back to the repository root.

### Authentication and OAuth

- Add the Railway Web domain to Firebase Authentication authorized domains.
- Keep Google as the only sign-in provider.
- Restrict the Firebase web API key to the production HTTP referrer / domain.
- Session cookies remain HTTP-only. The frontend never stores identity tokens.
- In production the session cookie is `Secure` and `SameSite=None` so the Railway Web origin can call the Railway API with `credentials: "include"`. Local development keeps `SameSite=Lax` and a non-secure cookie.
- Custom same-site domains (`https://app.example.com` and `https://api.example.com`) are the more durable cookie setup. Until those exist, `FRONTEND_ORIGIN` must match the Railway Web origin exactly.

### CORS

The API allows credentialed requests only from `FRONTEND_ORIGIN`. It does not use `*` and it does not reflect unknown origins.

---

## Deployment order

1. Create Railway PostgreSQL and link it to the API service.
2. Set API environment variables, including a temporary `FRONTEND_ORIGIN` if the Web URL is not known yet.
3. Deploy the API. Confirm `GET https://<api-host>/health` returns `{ "status": "ok" }`.
4. Set Web environment variables, including `VITE_API_URL` pointing at the Railway API origin.
5. Deploy the Web service.
6. Set `FRONTEND_ORIGIN` to the exact Railway Web origin and redeploy the API if the value changed.
7. Add the Railway Web domain to Firebase authorized domains.
8. Run the smoke tests below.

Frontend env vars are compile-time values. Changing `VITE_API_URL` or Firebase web config requires a new Web build.

---

## Post-deployment verification

- `GET /health` on the API returns `200` and `{ "status": "ok" }`.
- Opening a frontend route such as `/login` or `/dashboard` does not 404 on refresh.
- Continue with Google creates a session and lands on the dashboard or Master CV onboarding.
- Reloading the app restores the session through `GET /api/auth/me`.
- Creating an application, analyzing a job, and exporting a PDF still require an authenticated session.
- Browser requests to the API include CORS headers for the Railway Web origin only.
- API error responses are `{ "message": "..." }` and do not include stack traces.

---

## Rollback considerations

- Web: restore the previous successful Railway Web deployment.
- API: restore the previous successful Railway API deployment. Schema migrations are forward-only; rolling back the API image does not undo SQL. If a migration is incompatible with the previous API, restore a matching database backup before rolling back the service.
- Keep Prisma migrations committed and additive whenever possible.
- After rollback, confirm `FRONTEND_ORIGIN` and `VITE_API_URL` still match the live hosts.

---

## Security rules

- Never commit `.env`, `.env.local`, `.env.production`, or other files with real secrets.
- Never print secrets in logs, tickets, or pull requests.
- Never expose OpenAI keys, `DATABASE_URL`, Firebase service accounts, or session identifiers in API responses.
- Never trust client-provided user IDs. Authorization uses the server session.
- Do not enable development authentication bypasses.
- Do not log cookies, identity tokens, or personal CV contents.
- Generated PDFs are streamed to the owner and are not stored as public files.

---

## Production checklist

- [ ] Repository security audit completed; no secrets in git history or the working tree
- [ ] `.gitignore` excludes env files, secrets, local databases, logs, uploads, generated files, build artifacts, `node_modules`, IDE junk, and OS files
- [ ] `.env.example` files contain placeholders only
- [ ] Frontend env vars are public `VITE_` values only
- [ ] Backend secrets are set in Railway, not in source
- [ ] PostgreSQL is provisioned and `DATABASE_URL` is linked to the API service
- [ ] Prisma migrations apply with `prisma migrate deploy` during API start
- [ ] Railway API build generates Prisma Client, compiles the API, and starts `node dist/server.js`
- [ ] Railway API `PORT` and `GET /health` work
- [ ] Railway Web Root Directory is the repository root and SPA fallback is configured
- [ ] Railway Web starts with `npm run start --workspace=web`, never `npm run dev`
- [ ] `VITE_API_URL` points at the Railway API HTTPS origin
- [ ] `FRONTEND_ORIGIN` is the exact Railway Web HTTPS origin
- [ ] CORS allows only that frontend origin with credentials
- [ ] Session cookies are HTTP-only; production cookies are Secure
- [ ] Firebase authorized domains include the Railway Web host
- [ ] Firebase Admin credentials are provided as `FIREBASE_SERVICE_ACCOUNT`
- [ ] Google sign-in is the only authentication method
- [ ] Production URLs are not hardcoded in source
- [ ] Frontend production build succeeds with Railway Web env vars
- [ ] API production start succeeds after migrations
- [ ] Smoke tests: health, login, session restore, authenticated API call
- [ ] Error responses do not include stack traces or secrets
- [ ] Logs do not include tokens, API keys, or database credentials
- [ ] Rollback plan is understood for the Railway Web service, API service, and migrations
