# Phase 1002 — Technical research

**Status:** Complete  
**Date:** 2026-03-31

<user_constraints>

## User Constraints (from 1002-CONTEXT.md)

- **D-01 / D-02:** Dashboard loads transactions via `getTransactions` with optional `from` / `to` (ISO); `preset === "all"` omits date filter; API failure → Sonner toast + `createMockDashboardTransactions(now)` fallback.
- **D-03:** List contract for this phase focuses on **`from` / `to`** only; `categoryIds`, `page`, `pageSize` deferred to plan 02.
- **D-04–D-08:** Savings = income − expenses; pies by `categoryName`; monthly averages via existing `monthlyAverages`; default preset `last_3_months`; Recharts + shadcn cards.

</user_constraints>

## Project Constraints (from .cursor/rules/)

- Next.js App Router, same-origin `/api/*` from browser; Route Handlers proxy `API_URL`.
- TypeScript strict; `apiFetch` + user-visible errors (Sonner), not only `console.error`.
- Keep client surface small; dashboard already `dashboard-client.tsx`.

## Current implementation (pre–plan 01)

- **`app/api/transactions/route.ts` GET:** Forwards only optional `categoryType` to `${API_URL}/v1/transactions`; **does not** forward `from` / `to`.
- **`lib/api/transactions.ts`:** `getTransactions()` has **no** query arguments.
- **`components/dashboard/dashboard-client.tsx`:** Uses **`useMemo`** + **`createMockDashboardTransactions`** only — no fetch.
- **`components/dashboard/aggregates.ts`:** Accepts `Transaction[]` from app model; compatible with API-mapped transactions as long as `transactionDate` is `Date` and `categoryType` / `categoryName` populated.

## Standard approaches

- **Query forwarding:** Parse `from` / `to` from `request.url` `searchParams`; validate parseable dates; build backend `URLSearchParams` (preserve existing `categoryType` behavior when both appear).
- **Client:** Optional argument bag `getTransactions(opts?: { from?: string; to?: string })` building `/api/transactions?from=...&to=...` via `URLSearchParams` (omit keys when absent).
- **Dashboard loading:** `useEffect` + `AbortController` keyed on serialized range + preset `all` vs dated window; map `ResolvedDateRange` `null` to unfiltered list call.
- **ISO strings:** Use `Date#toISOString()` for `range.start` / `range.end` from `resolvePeriodRange` so backend receives full instants (matches BFF validation as ISO-parseable).

## Pitfalls

- **Race:** New request should abort prior in-flight fetch when period changes quickly.
- **Double filter:** If API already filters by `from`/`to`, client can still run `filterTransactionsByRange` for consistency — acceptable minor redundancy; alternatively trust API-only and skip client filter when `source === 'live'` — CONTEXT implies period drives query; simplest is **fetch filtered from API** and keep client filter as no-op for in-range data; executor may choose one path and document in code comment.
- **`API_URL` missing:** Existing route pattern returns 500 with message; dashboard catch path handles as fallback.

## Don't hand-roll

- Do not bypass `apiFetch` for transactions list.
- Do not change aggregate math in plan 01 beyond bugfixes.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (`npm test` in `package.json`) |
| Config file | none in repo root — use Next.js/Jest docs if adding first config in Wave 0 |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase requirements → test map

| Behavior | Test type | Automated command | Notes |
|----------|-----------|-------------------|-------|
| BFF builds correct backend query for `from`/`to` | unit | `npm test` | optional once test harness exists |
| URL builder encodes list query | unit | `npm test` | optional |

### Sampling rate

- Plan 01 gate: **`npm run build`** required before UAT.
- Phase gate: `/gsd-verify-work` against **`1002-UAT.md`**.

### Wave 0 gaps

- [ ] No `*.test.ts` files yet — plan 01 relies on build + manual UAT; add jest config in a later hygiene phase if required.

---

## RESEARCH COMPLETE
