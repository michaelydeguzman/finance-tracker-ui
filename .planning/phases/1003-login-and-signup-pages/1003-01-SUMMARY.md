---
phase: 1003-login-and-signup-pages
plan: 01
subsystem: ui
tags: [nextjs, app-router, route-groups, auth-ui]

# Dependency graph
requires: []
provides:
  - Slim root layout with ThemeProvider + Toaster
  - `(app)` shell with SidebarProvider + Header + existing dashboard routes
  - `(auth)` segment with `/login` and `/signup` and client forms
affects: []

key-files:
  created:
    - app/(app)/layout.tsx
    - app/(auth)/layout.tsx
    - app/(auth)/login/page.tsx
    - app/(auth)/signup/page.tsx
    - app/(auth)/components/login-form.tsx
    - app/(auth)/components/signup-form.tsx
  modified:
    - app/layout.tsx
    - routes.ts
    - components/header/header.tsx
    - app/(app)/** (moved from app/)

requirements-completed: []

duration: 25min
completed: 2026-04-18
---

# Phase 1003 — Plan 01 summary

**Split the global shell into `(app)` vs root so public auth routes render without the dashboard chrome, and added login/signup UI with header entry.**

## Accomplishments

- Root `app/layout.tsx` now only provides fonts, `ThemeProvider`, `Toaster`, and `{children}`.
- Dashboard routes live under `app/(app)/` with the previous Header + padding layout preserved.
- Added `/login` and `/signup` with shadcn `Card` + forms, cross-links, and **Log in** in the header.
- Updated `@/app/categories/*` imports to `@/app/(app)/categories/*` and fixed relative paths to `app/transactions` after the move.
