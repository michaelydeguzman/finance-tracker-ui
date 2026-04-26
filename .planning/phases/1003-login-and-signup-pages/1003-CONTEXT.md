# Phase 1003: Login and signup pages — Context

**Gathered:** 2026-04-18  
**Status:** Ready for planning  
**Source:** User request via `/gsd-plan-phase` (login + signup; follow existing styling)

<domain>

## Phase boundary

- **In scope:** Public **`/login`** and **`/signup`** pages; client-side form validation; submit via **`apiFetch`** to same-origin **`/api/auth/*`** route handlers; Sonner toasts + inline field errors on failure; **route-group layout** so auth pages do not render the main **Header** + padded shell from `app/layout.tsx` today.
- **Out of scope (later phases):** Session persistence (cookies/JWT), middleware-based route protection, OAuth, password reset, email verification, backend contract beyond documented stubs.

</domain>

<decisions>

## Implementation decisions

### UX / IA

- **D-01:** Two routes: **`/login`** (email + password) and **`/signup`** (email + password + confirm password, optional display name if trivial).
- **D-02:** Cross-links: “Create an account” on login → `/signup`; “Already have an account?” on signup → `/login`.
- **D-03:** Auth surfaces use **`@/components/ui/card`**, **`Button`**, **`Input`**, **`Spinner`** — same primitives as `add-transaction-dialog.tsx`; use **`cn()`** and semantic tokens (`bg-card`, `text-muted-foreground`, etc.), avoid new raw `gray-*` except where matching `header.tsx` is explicitly required for parity.

### Architecture

- **D-04:** **Slim `app/layout.tsx`:** Keep `Geist` fonts, `ThemeProvider`, `Toaster`, `body` classes only. Move **SidebarProvider + main chrome + Header** into **`app/(app)/layout.tsx`**. Move existing top-level route folders with **`page.tsx`** under **`app/(app)/`**: `page.tsx`, `income/`, `expenses/`, `categories/`, `households/`. Leave **`app/api/**`** and **`app/transactions/**`** (feature colocation without `page.tsx`) **in place** — imports stay `@/app/transactions/...`.
- **D-05:** Add **`app/(auth)/layout.tsx`**: centered column, min-height, subtle background consistent with `globals.css` / theme (no duplicate `ThemeProvider`).
- **D-06:** Colocate feature UI under **`app/(auth)/components/`** (e.g. `login-form.tsx`, `signup-form.tsx`) and thin **`page.tsx`** files.

### API (stubs)

- **D-07:** **`POST /api/auth/login`** and **`POST /api/auth/signup`** return **`501`** JSON `{ success: false, message: "…" }` (or **`400`** on malformed body) until `API_URL` exposes real paths — message must be user-visible via `apiFetch` throw + toast.
- **D-08:** Add **`lib/api/endpoints/auth.ts`** + **`lib/api/auth.ts`** with typed functions mirroring `lib/api/transactions.ts` style.

### Navigation

- **D-09:** Add header actions or compact text links to **`/login`** (and optionally **`/signup`**) without adding new top-level `ROUTES` primary nav items unless product asks — **minimum:** link from `UserHeader` or header right cluster; document choice in plan execution.

</decisions>

<canonical_refs>

## Canonical references

**Downstream agents MUST read these before implementing.**

### Repo rules & patterns

- `.cursor/rules/finance-tracker-agents.mdc` — Server/client boundaries, colocation, Toaster inside ThemeProvider.
- `app/layout.tsx` — Current root shell to split.
- `app/transactions/components/add-transaction-dialog.tsx` — Form + Sonner + `Input` + `Spinner` patterns.
- `lib/api/config.ts` — `apiFetch` contract.
- `.planning/codebase/INTEGRATIONS.md` — No auth today; env `API_URL` pattern for BFF.

### Design primitives

- `components/ui/card.tsx`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/spinner.tsx`

</canonical_refs>

<specifics>

## Specifics

- User asked to **follow existing styling** — reuse **shadcn Card** (not only legacy `components/shared/card.tsx`) for auth panels unless executor finds a documented exception in `1003-UI-SPEC.md`.

</specifics>

<deferred>

## Deferred ideas

- Protected routes, refresh tokens, social login, forgot-password flow.

</deferred>

---

*Phase: 1003-login-and-signup-pages*
