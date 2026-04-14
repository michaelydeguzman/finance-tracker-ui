# External Integrations

**Analysis Date:** 2026-03-29

## APIs & External Services

**Backend REST API (primary integration):**

- **Purpose:** CRUD for transactions and categories; all persistence and business rules live outside this repo.
- **Protocol:** HTTP `fetch` from Next.js Route Handlers to `{API_URL}/v1/...` (no SDK package).
- **Server-only config:** `process.env.API_URL` in:
  - `app/api/transactions/route.ts`
  - `app/api/transactions/[id]/route.ts`
  - `app/api/categories/route.ts`
  - `app/api/categories/[id]/route.ts`
- **Proxied paths (Next → backend):**
  - `GET`/`POST` `.../v1/transactions` (optional query `categoryType`)
  - `GET`/`PUT`/`DELETE` `.../v1/transactions/{id}`
  - `GET`/`POST` `.../v1/categories` (optional query `categoryType`)
  - `PUT`/`DELETE` `.../v1/categories/{id}` (note: `GET` by id for categories is not implemented on `[id]` route — only `PUT`/`DELETE` in `app/api/categories/[id]/route.ts`)
- **Client → Next:** Browser code calls **same-origin** `/api/*` URLs via `apiFetch` in `lib/api/config.ts` and endpoint constants in `lib/api/endpoints/transactions.ts`, `lib/api/endpoints/categories.ts`, composed in `lib/api/transactions.ts` and `lib/api/categories.ts`.
- **Response shape:** `lib/api/config.ts` documents handling of `ApiResponse<T>` from `types/shared/api-response.ts` (`success`, `message`, `data`). Route handlers often forward backend JSON directly — **ensure** backend responses match what `apiFetch` expects, or normalize in handlers.

**Fonts:**

- **Google Fonts** via `next/font/google` — `Geist` and `Geist_Mono` in `app/layout.tsx` (no separate API keys).

## Data Storage

**Databases:**

- Not applicable in this UI repository; data store is owned by the backend behind `API_URL`.

**File Storage:**

- Local filesystem / build output only (`.next`, static assets). No cloud object storage client in `package.json`.

**Caching:**

- No Redis or CDN-specific SDK detected in application dependencies.

## Authentication & Identity

**Auth Provider:**

- No OAuth, JWT library, or session provider appears in `package.json`.
- API route handlers do not attach `Authorization` headers in the reviewed `app/api/**/route.ts` files — **if** the backend requires auth, it must be added (headers, cookies, or server session) explicitly.

## Monitoring & Observability

**Error Tracking:**

- No Sentry, Datadog, or similar SDK in `package.json`.

**Logs:**

- `console.log` / `console.error` used in some route handlers (e.g. `app/api/categories/route.ts`). No structured logging framework detected.

## CI/CD & Deployment

**Hosting:**

- Not specified in repository (no deployment config file audited beyond Next.js defaults).

**CI Pipeline:**

- No `.github/workflows/*` present — **GitHub Actions not configured** in-repo at time of analysis (`.github/copilot-instructions.md` exists as docs only).

## Environment Configuration

**Required env vars (runtime):**

- `API_URL` — **required** for all `app/api` proxy routes that call the backend; without it, `fetch` targets are invalid.

**Optional env vars:**

- `NEXT_PUBLIC_APP_URL` — canonical site URL for metadata in `app/layout.tsx`
- `NEXT_CANARY` — toggles experimental PPR in `next.config.ts`
- `ANALYZE` — intended for bundle analysis when wired to `@next/bundle-analyzer`

**Secrets location:**

- Local `.env` (and deployment platform secret store); **never** commit or quote secret values in planning docs.

## Webhooks & Callbacks

**Incoming:**

- None dedicated; only standard Next.js `app/api/*` routes for app-initiated CRUD.

**Outgoing:**

- Server-side `fetch` only to the configured backend base URL (`API_URL`).

---

_Integration audit: 2026-03-29_
