# Phase 1001: Complete income and expense transaction CRUD — Context

**Gathered:** 2026-03-29
**Status:** Ready for planning
**Source:** User request via `/gsd-plan-phase` (express scope)

<domain>

## Phase Boundary

**In scope:** Income and expense **transaction** CRUD on the existing routes: add (already present), **edit** (persist via PUT), **delete** (persist via DELETE) with **confirmation** before irreversible delete.

**Out of scope:** Categories CRUD, households, auth, export flows, backend API changes (assume current Next.js proxy + backend contract remain as today).

</domain>

<decisions>

## Implementation Decisions

### Product / UX

- **D-01:** **Edit** must be available from both `/income` and `/expenses` for each listed transaction (same capabilities as add: name, category, description, amount, date; follow existing validation rules).
- **D-02:** **Delete** must require an explicit **confirmation** step before the delete API runs; user must not lose a row without confirming.
- **D-03:** Prefer **shadcn/ui** primitives (`Dialog`, `AlertDialog`, `Button`, etc.) and **Sonner** toasts for errors/success — align with `AddTransactionDialog` and Phase 1000 theming rules; avoid introducing new UI libraries.

### Technical

- **D-04:** Reuse **`useTransactions` / `useIncomeTransactions` / `useExpenseTransactions`** and `lib/api/transactions` — update/delete already exist; work is primarily UI wiring and any small hook API adjustments (e.g. avoid double confirmation if UI owns confirm).
- **D-05:** Keep **client boundaries** tight: colocate any new transaction UI under `app/transactions/components/` if shared by both routes, or extend existing `income-client` / `expense-client` + list components per repo colocation rules.
- **D-06:** **Transaction update/delete API surface** must match the **category** pattern end-to-end: **`lib/api/transactions.ts`** exposes `updateTransaction` / `deleteTransaction` using **`apiFetch`** + **`TRANSACTION_ENDPOINTS.byId(id)`** (same shape as `lib/api/categories.ts`); **`app/api/transactions/[id]/route.ts`** **`PUT`** / **`DELETE`** mirror **`app/api/categories/[id]/route.ts`** (415 on wrong `Content-Type`, validate id, validate/normalize body, proxy to `${API_URL}/v1/transactions/${id}`, map backend errors to `{ error: string }`, DELETE returns a clear JSON success message). Shared route validation helpers live under **`app/api/transactions/common/utils.ts`** (like categories’ `common/utils`).

### Claude's discretion

- Whether edit reuses an extended `AddTransactionDialog` (add + edit modes) vs a separate `EditTransactionDialog`.
- Exact row actions layout (icon buttons vs dropdown menu) as long as discoverable and accessible.
- Whether to replace `window.confirm` in `use-transactions.ts` with UI-layer confirmation only (recommended) to match D-03.

### Deferred ideas

- Bulk delete, undo, or soft-delete.
- Inline editing without a dialog.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Code (current behavior)

- `app/api/categories/[id]/route.ts`, `lib/api/categories.ts`, `lib/api/endpoints/categories.ts` — **reference pattern** for proxy + client helpers.
- `app/transactions/hooks/use-transactions.ts` — optimistic list, `updateTransaction` / `deleteTransaction` handlers (delete currently uses `window.confirm`).
- `app/transactions/components/add-transaction-dialog.tsx` — form patterns, validation, Sonner toasts.
- `app/income/components/income-client.tsx`, `app/expenses/components/expense-client.tsx` — only wire **add** today.
- `app/income/components/income-list.tsx`, `app/expenses/components/expense-list.tsx` — list rows; no actions yet.
- `lib/api/transactions.ts`, `app/api/transactions/[id]/route.ts` — PUT/DELETE proxy.

### Standards

- `.cursor/rules/finance-tracker-agents.mdc` — Server/client, colocation, Tailwind tokens, Sonner inside ThemeProvider.
- `.planning/phases/1000-cleanup-ui-coding-standards-find-what-is-messy-and-let-s-discuss/1000-CONTEXT.md` — UI standards (reference for tokens and client boundaries).

</canonical_refs>

---

*Phase: 1001-complete-income-and-expense-transaction-crud*
