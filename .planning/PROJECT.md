# Finance Tracker UI — Project

## What This Is

A personal finance tracking web app for managing income and expenses across households, with category breakdowns, dashboard analytics, and user authentication.

## Core Value

Clear visibility into where money comes in and goes out, with just enough structure to act on it.

## Requirements

### Validated

- ✓ UI coding standards locked (server/client boundaries, Tailwind tokens, shadcn Toaster inside ThemeProvider) — v1.0
- ✓ Full CRUD for income and expense transactions (add, edit, delete with confirmation) — v1.0
- ✓ Dashboard analytics with bar chart (income/expenses/savings), pie charts by category, period presets — v1.0
- ✓ Login and signup pages with validation, Sonner errors, theme support, auth route group — v1.0
- ✓ BFF stubs for auth API (`/api/auth/login`, `/api/auth/signup`) — v1.0

### Active

- [ ] Real backend auth integration (replace BFF stubs with actual JWT/session flow)
- [ ] Household management (create, switch, invite members)
- [ ] Category management UI (add/edit/delete custom categories)

### Out of Scope

- Mobile native app — web-first with responsive design
- Multi-currency — single currency per user for now

## Context

Shipped v1.0 MVP with 59 TypeScript/React files.
Stack: Next.js 15 App Router, React 19, Tailwind, shadcn/ui, next-themes.
Backend assumed as separate service; all API calls proxied through Next.js BFF (`app/api/*`).
Auth is stubbed (501) — real backend integration is next milestone priority.

## Key Decisions

| Decision | Outcome | Milestone |
|----------|---------|-----------|
| Route groups `(app)` / `(auth)` for shell separation | ✓ Good — clean split, auth pages have no dashboard chrome | v1.0 |
| BFF stubs for auth before backend is ready | ✓ Good — unblocks UI work, clear upgrade path | v1.0 |
| Mock data fallback for dashboard | ✓ Good — allows dev without live data | v1.0 |
| `DarkModeTrigger` added to auth layout | ✓ Good — theme accessible everywhere | v1.0 |
| `"use client"` on `DarkModeTrigger` | ✓ Fixed — was missing, caused SSR error | v1.0 |

---
*Last updated: 2026-04-25 after v1.0 milestone*
