# Phase 1000: Cleanup ui coding standards - Discussion Log

> **Audit trail only.** Decisions live in `1000-CONTEXT.md`.

**Date:** 2026-03-29
**Phase:** 1000 — Cleanup ui coding standards
**Areas discussed:** Must-have bucket — React boundaries, colocation, Tailwind tokens, theming + Toaster

---

## Must-have bucket (async capture)

User direction: **start with must-have first** (server/client, architecture/colocation, semantic Tailwind tokens, theming + Sonner).

| Topic | Notes | Captured as |
|-------|--------|-------------|
| Server vs client | Server by default; client only when needed | CONTEXT D-01, D-02 |
| Where code lives | `app/<route>/…`, `shared/`, `layout/`, `ui/` | CONTEXT D-03–D-05 |
| Styling | Semantic tokens + `cn()` | CONTEXT D-06, D-07 |
| Theming | ThemeProvider contract; Sonner from `@/components/ui/sonner`; Toaster inside ThemeProvider; fix current layout order | CONTEXT D-08–D-11 + layout bug called out |

**User's choice:** Proceed with must-haves as specified above; remaining gray areas deferred to later discuss or execution waves.

**Notes:** `app/layout.tsx` currently imports `Toaster` from `sonner` and mounts it **outside** `ThemeProvider`; execution phase should switch import and nesting per D-09–D-10.

---

## Claude's Discretion

- Lint/prettier strictness for token vs raw palette classes.
- Whether to add `suppressHydrationWarning` on `<html>` after verification (D-11).

## Deferred Ideas

- Should-have / nice-have from prior recommendation list.
- Optional discuss items: Button vs raw button, `use client` formatting, hooks naming, reconcile copilot `ui/` wording with practice.
