# Phase 1003 — UI design contract

**Status:** Draft  
**Date:** 2026-04-18

## Scope

Public **login** and **signup** screens for Finance Tracker, matching the established **shadcn/ui + Tailwind** look and **Geist** typography from root layout.

## Layout

- **Auth shell (`app/(auth)/layout.tsx`):** Full viewport min-height; content horizontally centered; max width **`sm`** (~24rem) for the card column; vertical padding **`py-12`**; background uses theme **`bg-background`** (no hard-coded white) unless `globals.css` defines a branded gradient — prefer semantic tokens.
- **No** `Header`, **no** `SidebarProvider`, **no** `px-[80px]` app shell on auth routes.

## Components

- **Container:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` from `@/components/ui/card`.
- **Controls:** `Button` (primary full-width submit), `Input` (`type="email"`, `type="password"`).
- **Loading:** `Spinner` + disabled inputs during submit, matching transaction dialog behavior.
- **Typography:** Titles **`text-2xl`** semibold; descriptions **`text-sm text-muted-foreground`**.

## Login page (`/login`)

- Fields: **email**, **password**.
- Primary button label: **“Sign in”**.
- Footer link: **“Create an account”** → `/signup` (`Link` from `next/link`).

## Signup page (`/signup`)

- Fields: **email**, **password**, **confirm password**; optional **display name** (if implemented, single optional `Input` — not required for MVP stub).
- Primary button label: **“Create account”**.
- Footer link: **“Sign in instead”** → `/login`.

## Validation (inline)

- Empty fields: inline text under field or `text-destructive` line under group (pick one pattern consistently across both forms).
- Email: browser + optional simple regex only if needed; do not block stub API on format beyond non-empty.
- Password: minimum **8** characters on signup; confirm must match password.
- Login: non-empty password only (no strength rule).

## Feedback

- **Sonner** `toast.error` on thrown `apiFetch` errors (message from server JSON).
- Do not use `window.alert` or `confirm`.

## Accessibility

- Associate **`<label htmlFor=...>`** (visually hidden or above field) with every `Input`.
- Submit on Enter from any field.

## Global entry

- **Header** (authenticated shell): discrete text button or link style **“Log in”** pointing to `/login` (exact placement in executor discretion per `1003-CONTEXT.md` D-09).

---

*End UI-SPEC*
