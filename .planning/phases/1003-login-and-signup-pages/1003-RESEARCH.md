# Phase 1003 — Technical research

**Status:** Complete  
**Date:** 2026-04-18

<user_constraints>

## User constraints (from 1003-CONTEXT.md)

- Login + signup pages, existing **Tailwind + shadcn + ThemeProvider** styling.
- Route group **without main chrome**; slim root layout + `(app)` shell.
- BFF stubs under **`app/api/auth/*`** + **`lib/api/auth`** until backend exists.

</user_constraints>

## Project constraints

- Next.js **App Router**; default **Server Components**; `"use client"` only for forms and navigation handlers.
- TypeScript strict; **`apiFetch`** for client calls; user-visible errors (**Sonner**), not only `console.error`.
- **INTEGRATIONS.md:** no OAuth/JWT in repo today; forward-auth to backend when URLs are known.

## Current implementation (pre-phase)

- **`app/layout.tsx`:** Embeds **SidebarProvider**, **Header**, padded **`main`** around **all** routes — auth pages would incorrectly show full shell.
- **No** `app/login` or `app/signup` routes.
- **`routes.ts`** imports **`Home`** from `./app/page` — path **must** update when `page.tsx` moves to **`app/(app)/page.tsx`**.
- Forms elsewhere (e.g. **`add-transaction-dialog.tsx`**) use **`toast`** from **`sonner`**, **`Input`**, **`Button`**, **`Spinner`**.

## Standard approaches

- **Route groups:** `(app)` vs `(auth)` share root `layout.tsx` for fonts/theme/toast; segment layouts own chrome.
- **Validation:** Client: HTML5 `type="email"`, min password length (e.g. **8**), confirm match on signup; server: JSON body checks in route handlers before any `fetch(API_URL)`.
- **501 stub:** Clear message e.g. `"Authentication API is not configured."` so QA understands state.

## Pitfalls

- **Import paths:** After moving `app/page.tsx`, fix **`routes.ts`** `import Home from "..."`.
- **Duplicate providers:** Do not nest second **`ThemeProvider`** under `(auth)`.
- **`loading.tsx`:** Root `app/loading.tsx` still wraps all segments — acceptable; auth pages should still render centered card.

## Don't hand-roll

- Do not bypass **`apiFetch`** for auth POSTs from the client.
- Do not introduce a new **`buttons/`** or **`common/`** folder.

## Validation Architecture

### Test framework

| Property | Value |
|----------|-------|
| Framework | Jest (`npm test` from `package.json` if present) |
| Config file | As existing in repo |
| Quick run command | `npm run build` |
| Full suite command | `npm test` (when configured) |

### Phase requirements → test map

| Behavior | Test type | Automated command | Notes |
|----------|-----------|-------------------|-------|
| Route groups compile; `/login` `/signup` resolve | build | `npm run build` | primary gate |
| BFF returns JSON error shape | manual or future unit | — | stub behavior |

### Sampling rate

- After each plan wave: **`npm run build`**.
- Sign-off: **`1003-UAT.md`**.

### Wave 0 gaps

- [ ] No auth-specific tests yet — phase relies on **build + UAT**; add Jest tests for validators in a follow-up if desired.

---

## RESEARCH COMPLETE
