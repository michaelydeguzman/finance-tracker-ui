---
phase: 1003-login-and-signup-pages
plan: 02
subsystem: api
tags: [bff, apiFetch, auth-stub]

# Dependency graph
requires:
  - plan: 1003-01
    provides: Auth forms and routes
provides:
  - POST `/api/auth/login` and `/api/auth/signup` stubs (501 + structured errors)
  - `lib/api/auth.ts` + `AUTH_ENDPOINTS`
  - Client submit wiring with Sonner + Spinner
affects: []

key-files:
  created:
    - lib/api/endpoints/auth.ts
    - lib/api/auth.ts
    - app/api/auth/login/route.ts
    - app/api/auth/signup/route.ts
  modified:
    - lib/api/config.ts
    - app/(auth)/components/login-form.tsx
    - app/(auth)/components/signup-form.tsx

requirements-completed: []

duration: 15min
completed: 2026-04-18
---

# Phase 1003 — Plan 02 summary

**Added same-origin auth BFF stubs and wired login/signup forms through `apiFetch`, with non-OK responses surfacing `message`/`error` in thrown errors.**

## Accomplishments

- `apiFetch` now reads `message` when `error` is absent on failed HTTP responses (so auth JSON matches the plan).
- Route handlers validate JSON bodies and return `400` / `501` with explicit messages including `Authentication API is not configured.`
- Client `login` / `signup` helpers call the BFF; forms show `toast.error` on failure and disable during submit.
