# Phase 1002: Dashboard analytics — Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>

## Phase Boundary

Deliver the **Dashboard analytics** experience on `/`:

- Bar chart: **income**, **expenses**, **savings**
- Pie charts: **expenses by category**, **income by category**
- **Monthly averages**
- Period presets + **custom date range**

Data source:
- Use **live transactions** via the existing client/BFF (`/api/transactions` → backend `/api/v1/transactions`) using the new list query params (`from`, `to`, optional paging/filtering).
- Keep a **safe fallback to mock transactions** for demo/dev resilience when the API is unavailable.

Out of scope: authentication, new backend endpoints, and non-dashboard product features.

</domain>

<decisions>

## Implementation Decisions

### Data source & filtering

- **D-01:** Dashboard fetches transactions via `getTransactions({ from, to })` (ISO strings) derived from the selected period range. If range is `all`, call `getTransactions()` with no date filter.
- **D-02:** If the API call fails, show a non-blocking error toast and render an **empty state** (no demo/mock fallback data).
- **D-03:** Keep the backend query-param contract limited to **`from` / `to`** for now; support for `categoryIds`, `page`, `pageSize` is deferred until a later step requires it.

### Metrics semantics

- **D-04:** Savings equals **income − expenses** over the selected period (net cashflow). Negative savings is allowed and should be displayed as-is.
- **D-05:** Category pies group by `categoryName` and sum `amount` within the selected period.
- **D-06:** Monthly averages are computed as “total in range ÷ months in range” (inclusive month span), matching the existing `monthlyAverages(...)` logic.

### UX defaults

- **D-07:** Default period preset remains **`last_3_months`**.
- **D-08:** Keep the existing dashboard layout and Recharts approach; prefer shadcn/ui cards + tokens.

### Claude’s discretion

- Loading microcopy/spinner details and minor chart styling, as long as it remains accessible and token-driven.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dashboard implementation (current)
- `app/page.tsx` — Dashboard entry point
- `components/dashboard/dashboard-client.tsx` — charts, controls, fetch + fallback behavior
- `components/dashboard/date-range.ts` — presets + range resolution
- `components/dashboard/aggregates.ts` — totals, pies, monthly averages
- `components/dashboard/mock-transactions.ts` — mock transaction generator

### Transactions API integration
- `lib/api/transactions.ts` — `getTransactions(...)` (supports list query)
- `lib/api/endpoints/transactions.ts` — `transactionListUrl(...)`
- `app/api/transactions/route.ts` + `app/api/transactions/common/utils.ts` — query validation + proxy forwarding to backend

### Backend contract
- Backend Swagger: `https://localhost:7203/swagger/index.html` (`GET /api/v1/transactions` params: `from`, `to`, `categoryIds`, `page`, `pageSize`, `categoryType`)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable assets
- `components/ui/chart` + shadcn Card primitives — consistent chart UI wrapper
- `lib/api/config.ts` (`apiFetch`) — consistent client error handling

### Established patterns
- Use same-origin `/api/*` calls from the browser; Route Handlers proxy to `API_URL`.
- Use Sonner toasts for user-visible error feedback.

### Integration points
- Period selection produces a `{ start, end }` range; use it to drive `getTransactions({ from, to })`.

</code_context>

<specifics>

## Specific Ideas

- Replace “demo data only” messaging with “live API” messaging when the API works, and a clear fallback message when it doesn’t.

</specifics>

<deferred>

## Deferred Ideas

- Dashboard filters beyond date range (category multi-select, pagination UI).
- Auth-backed `createdBy` instead of hard-coded actor.

</deferred>

---

*Phase: 1002-dashboard-analytics*
