# Architecture

**Analysis Date:** 2026-03-29

## Pattern Overview

**Overall:** Next.js App Router single-page areas with a **Backend-for-Frontend (BFF)** layer: the browser calls same-origin **Route Handlers** under `app/api/`, which proxy to an external HTTP API using `process.env.API_URL`.

**Key Characteristics:**

- **UI** is mostly **Client Components** for data-heavy screens; **Server Components** compose shell + `PageTitle` and mount client trees.
- **Data access** from the client goes through **`lib/api/*`** (`apiFetch` + endpoint constants), never directly to `API_URL` from the browser.
- **Validation** is duplicated in Route Handlers (request shape) and often again in hooks/UI (user feedback); backend failures surface as HTTP errors and `apiFetch` throws.

## Layers

**Presentation (routes + feature UI):**

- Purpose: App Router pages, layout, feature-specific components and hooks.
- Location: `app/`, `components/`
- Contains: `page.tsx`, `layout.tsx`, `components/*`, `hooks/*`, `data/*`, `types/*` under each route segment.
- Depends on: `lib/api/*`, `components/ui/*`, `components/shared/*`, `components/layout/*`, `@/types/*`
- Used by: Browser; Server renders RSC shells.

**API client (typed helpers):**

- Purpose: Build requests to **relative** `/api/*` URLs, unwrap `ApiResponse<T>` or handle errors consistently.
- Location: `lib/api/config.ts`, `lib/api/transactions.ts`, `lib/api/categories.ts`, `lib/api/endpoints/*`
- Contains: `apiFetch`, CRUD helpers, URL builders.
- Depends on: `types/shared/api-response.ts`, feature types under `app/*/types/*`
- Used by: Client hooks (e.g. `app/transactions/hooks/use-transactions.ts`) and any code that can call `fetch`.

**BFF / Route Handlers:**

- Purpose: Authenticate nothing in-repo today; validate inputs; forward to `${API_URL}/v1/...`; map status codes and bodies.
- Location: `app/api/transactions/route.ts`, `app/api/transactions/[id]/route.ts`, `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts`, shared helpers `app/api/categories/common/utils.ts`
- Contains: `GET`/`POST`/`PUT`/`DELETE` exports using Web `Request` / `Response`.
- Depends on: `process.env.API_URL` (server-only), types from feature folders for request bodies.
- Used by: `fetch` from the Next.js app (browser or server).

**External backend:**

- Purpose: Persistent finance API (`/v1/transactions`, `/v1/categories`, query params such as `categoryType`).
- Location: Outside this repository; base URL from environment (not documented here).

**Cross-cutting types:**

- Purpose: Shared enums and API envelope.
- Location: `types/shared/api-response.ts`, `types/shared/enums.ts`, `types/shared/frequency.api.ts`, `types/app.ts`

## Data Flow

**Read/write transactions (typical):**

1. User interacts with a **Client Component** (e.g. `app/expenses/components/expense-client.tsx`) wired to a hook (`app/expenses/hooks/use-expense-transactions.ts` → `app/transactions/hooks/use-transactions.ts`).
2. Hook calls **`getTransactionsByType`** or mutators in `lib/api/transactions.ts`.
3. **`apiFetch`** in `lib/api/config.ts` issues `fetch("/api/transactions?categoryType=…", …)` (browser → same origin).
4. **`app/api/transactions/route.ts`** (or `[id]/route.ts`) validates query/body, then `fetch(`${API_URL}/v1/transactions…`)`.
5. Response JSON is returned to the client; `apiFetch` unwraps **`ApiResponse<T>`** when `success === false` throws; otherwise returns `data`. `lib/api/transactions.ts` maps DTOs to domain types (e.g. `Date` fields).

**Read/write categories:**

- Same pattern via `lib/api/categories.ts` and `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts`, using `CATEGORY_ENDPOINTS` from `lib/api/endpoints/categories.ts`.

**State Management:**

- **Local React state** and **`useOptimisticList`** (`hooks/use-optimistic-list.ts`) for optimistic add/update/delete with rollback implied by refetch/error handling patterns in hooks.
- No global store (Redux/Zustand) in-repo.

## Key Abstractions

**`apiFetch<T>`:**

- Purpose: Single entry for client-side calls to internal API routes; normalize errors (`error` field on non-OK responses; `success: false` envelope).
- Examples: `lib/api/config.ts`
- Pattern: Typed unwrap; **204** / empty body treated as `undefined`.

**Endpoint constants:**

- Purpose: Avoid stringly-typed URLs for `/api/*`.
- Examples: `lib/api/endpoints/transactions.ts`, `lib/api/endpoints/categories.ts`, barrel `lib/api/endpoints/index.ts`

**Feature hooks:**

- Purpose: Encapsulate loading, optimistic mutations, and validation UX for a resource.
- Examples: `app/transactions/hooks/use-transactions.ts`, `app/categories/hooks/use-categories.ts`, `app/expenses/hooks/use-expense-transactions.ts`

## Entry Points

**HTTP (user-facing):**

- Location: `app/layout.tsx` (root layout), `app/page.tsx` (dashboard), segment `page.tsx` files under `app/income/`, `app/expenses/`, `app/categories/`, `app/households/`.
- Triggers: Next.js routing from `routes.ts` navigation in `components/header/header.tsx`.
- Responsibilities: Compose `PageTitle`, client feature UI, static/marketing shell.

**API (machine-facing, same deployment):**

- Location: `app/api/**/route.ts`
- Triggers: `fetch` from app code to `/api/...`
- Responsibilities: Proxy, validate, status mapping.

## Error Handling

**Strategy:** Layered — HTTP status on Route Handlers; thrown `Error` from `apiFetch`; some hooks use `console.error` or `alert`; some UI uses Sonner (`components/ui/sonner.tsx`, `toast` in clients).

**Patterns:**

- Route Handlers: `Response.json({ error: message }, { status })` for validation and upstream failures (`app/api/transactions/route.ts`, `app/api/categories/route.ts`).
- Client: `apiFetch` throws on `!response.ok` or `success === false` in `lib/api/config.ts`.
- DELETE success paths may return `{ message }` without full `ApiResponse` shape; `apiFetch` allows absence of `success` when HTTP OK (see comment in `lib/api/config.ts`).

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` in some Route Handlers (e.g. `app/api/categories/route.ts`); client hooks may `console.error` on fetch failure.

**Validation:** Route Handlers validate JSON content-type, required fields, numeric ranges, dates (`app/api/transactions/route.ts`, `app/api/categories/route.ts`); client duplicates checks for immediate UX (`app/transactions/hooks/use-transactions.ts`).

**Authentication:** Not implemented in reviewed routes; `createdBy` is a required string on transaction payloads (API contract).

---

_Architecture analysis: 2026-03-29_
