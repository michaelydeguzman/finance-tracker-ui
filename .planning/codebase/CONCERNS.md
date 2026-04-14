# Codebase Concerns

**Analysis Date:** 2026-03-29

## Tech Debt

**API route handlers — duplicated validation and helpers:**

- Issue: Transaction and category validation logic (dates, types, required fields) is implemented in both Next.js route handlers and client hooks. Changes can drift between layers.
- Files: `app/api/transactions/route.ts`, `app/api/transactions/[id]/route.ts`, `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts`, `app/transactions/hooks/use-transactions.ts`, `app/categories/hooks/use-categories.ts`
- Impact: Inconsistent error messages or rules between UI and API; higher maintenance cost.
- Fix approach: Extract shared Zod (or similar) schemas and reuse in route POST/PUT handlers; keep hooks for UX-only checks.

**Hard-coded actor for transactions:**

- Issue: `DEFAULT_CREATED_BY` is fixed to `"finance-tracker-ui"` in `app/transactions/hooks/use-transactions.ts`.
- Impact: All writes appear as the same user; no real identity until auth exists.
- Fix approach: Replace with authenticated user id or explicit user selection when auth is added.

**Households feature is mock-only:**

- Issue: `app/households/components/household-list.tsx` uses in-memory `MOCK_HOUSEHOLDS` and comment `// Mock data - replace with actual household data`.
- Impact: No persistence, no API parity with categories/transactions.
- Fix approach: Add backend contract and proxy routes when the API exists; remove mock state.

**Type assertion in category updates:**

- Issue: `updateCategory` callback uses `as Category` in `app/categories/hooks/use-categories.ts`.
- Impact: Masks shape mismatches between `UpsertCategoryRequest` and `Category`.
- Fix approach: Narrow types so `useOptimisticList` updateFn accepts `Partial<Category>` or a dedicated patch type without assertion.

**Jest scripts without toolchain:**

- Issue: `package.json` defines `test`, `test:watch`, and `test:coverage` for Jest, but there is no `jest` dependency, no `jest.config.*`, and no `*.test.*` / `*.spec.*` files in the repo.
- Impact: `npm test` fails or is non-functional; CI cannot rely on tests.
- Fix approach: Add Jest (or replace with Vitest), add config, and add initial tests; or remove scripts until testing is real.

**Debug logging in categories API:**

- Issue: `console.log` of backend URL in `app/api/categories/route.ts` (GET handler).
- Impact: Log noise; in some deployments logs may be collected and expose internal URLs or query patterns.
- Fix approach: Remove or gate behind a debug flag; use structured logging with redaction if needed.

## Known Bugs

**Categories initial load and `pending`:**

- Symptoms: `useCategories` (`app/categories/hooks/use-categories.ts`) only reflects `useTransition` pending state from `useOptimisticList`, not initial fetch progress. Lists may render empty until the fetch resolves without a consistent loading indicator (unlike `useTransactions`, which merges `isFetching`).
- Files: `app/categories/hooks/use-categories.ts`, `app/transactions/hooks/use-transactions.ts`
- Trigger: Open categories view on a slow network.
- Workaround: None in code; UX may feel broken compared to transactions.

## Security Considerations

**API proxy and open BFF routes:**

- Risk: Route handlers under `app/api/transactions/*` and `app/api/categories/*` forward requests to the backend using `process.env.API_URL`. There is no `middleware.ts` and no session checks on these routes—anyone who can reach the Next deployment can invoke them.
- Files: `app/api/transactions/route.ts`, `app/api/transactions/[id]/route.ts`, `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts`
- Current mitigation: Backend may enforce its own auth; reliance is entirely on the downstream API.
- Recommendations: Add auth at the Next layer (cookies, headers, or middleware) aligned with the backend; rate-limit public proxies if they must stay anonymous.

**Missing or invalid `API_URL`:**

- Risk: `API_URL` is read at module scope with no guard. If unset, `fetch` targets `"undefined/v1/..."` or similar, causing opaque failures.
- Files: All four route files above
- Current mitigation: None in code (deployment must set env).
- Recommendations: Validate at startup or per-request and return `500` with a safe message; document required vars (`.env.example` is not present in repo).

**Backend error bodies forwarded to clients:**

- Risk: `response.text()` from the backend is often returned as the JSON `error` field when `!response.ok`, potentially leaking internal messages.
- Files: `app/api/transactions/route.ts`, `app/api/transactions/[id]/route.ts`, `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts`
- Current mitigation: Clients see the same text the backend returns.
- Recommendations: Map known status codes to stable user-facing messages; log full backend body server-side only.

**Public metadata base URL:**

- Risk: `metadataBase` falls back to `http://localhost:3000` when `NEXT_PUBLIC_APP_URL` is unset (`app/layout.tsx`), which can produce wrong canonical URLs in production if misconfigured.
- Current mitigation: Override via `NEXT_PUBLIC_APP_URL` in production.
- Recommendations: Fail build or warn in CI when production build lacks the public URL.

## Performance Bottlenecks

**Full list refetch pattern:**

- Problem: `useTransactions` and `useCategories` load full lists per `categoryType` on mount and type change via `useEffect`; no pagination or incremental sync.
- Files: `app/transactions/hooks/use-transactions.ts`, `app/categories/hooks/use-categories.ts`
- Cause: Simple CRUD model against list endpoints.
- Improvement path: Backend pagination/infinite scroll; SWR/React Query caching if multiple consumers mount.

**Large generated UI module:**

- Problem: `components/ui/sidebar.tsx` is a very large single file (hundreds of lines), increasing parse and review cost.
- Files: `components/ui/sidebar.tsx`
- Cause: Typical shadcn-style single-file component.
- Improvement path: Split only if maintaining locally; otherwise accept as vendor-style chunk.

## Fragile Areas

**`useEffect` data fetching:**

- Files: `app/transactions/hooks/use-transactions.ts`, `app/categories/hooks/use-categories.ts`
- Why fragile: Race handling differs (`isActive` cleanup in transactions only); category hook lacks loading state and only logs `console.error` on failure—no user-facing toast for initial load failure.
- Safe modification: Preserve cleanup flags; align both hooks on loading and error surfacing (e.g. Sonner); consider TanStack Query for deduplication and retries.
- Test coverage: No automated tests for these hooks.

**Native `alert` / `confirm` for validation and delete:**

- Files: `app/transactions/hooks/use-transactions.ts`, `app/categories/hooks/use-categories.ts`
- Why fragile: Blocks the main thread, inconsistent with Sonner usage elsewhere (`hooks/use-optimistic-list.ts`, `app/categories/components/category-list.tsx`).
- Safe modification: Replace with `toast` + inline field errors; use `AlertDialog` from `components/ui/` for destructive confirmations.
- Test coverage: None.

**Optimistic updates rollback:**

- Files: `hooks/use-optimistic-list.ts`
- Why fragile: Failed mutations log to console and toast; reconciling server ids after add depends on API returning the created entity. Temp ids use `crypto.randomUUID` with `Date.now` fallback.
- Safe modification: Ensure API always returns full entities; add tests for failure paths.
- Test coverage: None.

## Scaling Limits

**In-memory household list:**

- Current capacity: Bounded by browser memory only; no shared state.
- Limit: Not multi-user or multi-device.
- Scaling path: Backend + API routes + same patterns as categories.

## Dependencies at Risk

**Test runner mismatch:**

- Package: Jest (referenced in scripts only).
- Risk: Scripts are stale relative to actual stack; developers may assume tests exist.
- Impact: Broken expectations in CI or onboarding.
- Migration plan: Add Jest + React Testing Library or switch to Vitest and align `package.json`.

## Missing Critical Features

**Authentication and authorization:**

- Problem: No Next-auth, middleware, or session handling in repo.
- Blocks: Multi-user security, personalized `createdBy`, protecting `/api/*` proxies.

**Households domain:**

- Problem: Mock UI only (`app/households/components/household-list.tsx`).
- Blocks: Real household management workflows.

## Test Coverage Gaps

**No unit or integration tests:**

- What's not tested: Hooks (`use-transactions`, `use-categories`, `use-optimistic-list`), API route handlers, and UI flows.
- Files: Entire `app/` and `hooks/` under `*.ts` / `*.tsx` without `*.test.*` siblings.
- Risk: Regressions in validation, proxy forwarding, and optimistic behavior go unnoticed.
- Priority: High for hooks and API routes once Jest/Vitest is wired.

**TODO / FIXME markers:**

- Repository scan for `TODO`, `FIXME`, `HACK`, `XXX` in `*.ts` / `*.tsx`: no matches found. Debt is implicit (comments like mock data) rather than tagged.

---

_Concerns audit: 2026-03-29_
