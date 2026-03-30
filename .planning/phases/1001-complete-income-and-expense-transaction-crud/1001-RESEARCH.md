# Phase 1001 — Technical research

**Status:** Complete  
**Date:** 2026-03-29

<user_constraints>

## User Constraints (from CONTEXT.md)

- **D-01 / D-02 / D-03:** Edit + delete with explicit confirmation; shadcn + Sonner; match Add dialog patterns.
- **D-04 / D-05:** Reuse `useTransactions` stack; colocate shared UI under `app/transactions/components/` when shared.

</user_constraints>

## Project Constraints (from .cursor/rules/)

- Next.js App Router, React 19, Tailwind, shadcn under `components/ui/`.
- TypeScript strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- Prefer Server Components; `"use client"` only where needed — transaction lists are already client.
- API via `apiFetch` / `app/api/*` proxies; user-facing errors via Sonner / inline validation, not only `console.error`.
- Semantic Tailwind tokens + `cn()`; avoid ad-hoc `gray-*` where tokens exist.

## Current implementation (HIGH confidence)

- **`useTransactions`** already implements `updateTransaction` and `deleteTransaction` with optimistic updates via `useOptimisticList`. `deleteTransaction` uses **`window.confirm`** — conflicts with D-03 if we lock on shadcn; **resolve by moving confirmation to UI** and calling a delete path without browser confirm (e.g. new internal method or parameter documented in plans).
- **`AddTransactionDialog`** is the reference for form fields, category selects, date input, and **Sonner** validation messages.
- **API:** `PUT` / `DELETE` on `app/api/transactions/[id]/route.ts` and `lib/api/transactions.ts` are implemented.
- **`IncomeList` / `ExpenseList`:** Render rows with no action affordances; **`income-client` / `expense-client`** only expose `add*Transaction`.

## Standard Stack

- Forms/dialogs: Radix-based shadcn `Dialog`, `Button`, `Input`, `Select` (existing).
- Delete confirmation: **`AlertDialog`** from shadcn is the standard pattern; **not present in `components/ui/` yet** — add via shadcn CLI or manual parity with existing ui components (planner task).

## Architecture Patterns

- **Shared edit surface:** Parameterized dialog (mode `create` | `edit`, optional `transactionId` + seed values) avoids duplicating income vs expense forms; branch only on `CategoryType`.
- **List row actions:** DropdownMenu or icon row actions at end of row; keep hit targets ≥ 44px where feasible.
- **Delete flow:** User clicks Delete → `AlertDialog` with transaction name → Confirm calls `deleteItem` / API; Cancel closes dialog. **Remove `window.confirm` from hook** when UI owns confirmation to prevent double prompts.

## Common Pitfalls

- **Double confirmation** if UI uses AlertDialog and hook still calls `confirm()`.
- **Category name desync** on edit: ensure `categoryName` passed to `updateTransaction` matches selected category id (mirror add dialog).
- **`createdBy`:** PUT handler requires `createdBy` in body — ensure edit payload includes existing or default `finance-tracker-ui` like add flow.
- **Optimistic rollback:** `useOptimisticList` should already surface failures; ensure toast on error for edit/delete (replace `alert()` usage where touched).

## Don't Hand-Roll

- Do not add a second HTTP client; use `lib/api/transactions.ts`.
- Do not duplicate validation rules — extract or mirror `AddTransactionDialog` validation.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (see `package.json` `"test": "jest"`) |
| Config file | none detected in repo root — **Wave 0** may need `jest.config` + first test file |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase requirements → test map

| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| TBD-EDIT | Edit persists required fields / validation | unit / component | `npm test` | ❌ Wave 0 |
| TBD-DEL | Delete confirm gate — no API call until confirm | unit / component | `npm test` | ❌ Wave 0 |

### Sampling rate

- Per task commit: `npm test` (once tests exist).
- Phase gate: `npm test` green before UAT.

### Wave 0 gaps

- [ ] Add `jest.config` (or Next.js Jest integration) if missing after inventory.
- [ ] First tests targeting transaction dialog hook behavior or pure validation helpers (avoid heavy E2E unless already present).

*Existing test files: none found (`*.test.*` / `*.spec.*`).*

## Sources

- Repo files: `use-transactions.ts`, `add-transaction-dialog.tsx`, `income-client.tsx`, `expense-client.tsx`, API routes, `.cursor/rules/finance-tracker-agents.mdc`.

## RESEARCH COMPLETE
