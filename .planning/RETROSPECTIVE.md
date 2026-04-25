# Retrospective

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-25
**Phases:** 4 (1000–1003) | **Plans:** 8

### What Was Built

- Locked UI coding standards: server/client boundaries, Tailwind tokens, shadcn Toaster inside ThemeProvider
- Full CRUD on income and expense transactions — edit in-place + delete with AlertDialog confirmation
- Dashboard analytics — bar chart (income/expenses/savings), pie charts by category, monthly averages, period presets + custom range
- Login and signup pages — auth route group `(app)`/`(auth)`, inline validation, Sonner errors, BFF stubs for auth API

### What Worked

- Route groups cleanly separated the auth shell from the app shell with zero shared layout pollution
- BFF stub pattern (`501 + structured error`) unblocked all frontend work without needing a real backend
- UAT-driven verification caught real bugs (missing spacing, missing `"use client"`, no theme toggle on auth pages)
- Colocating phase code under `app/<route>/components|hooks|types|data` kept diffs small and reviewable

### What Was Inefficient

- Phase 1000 ended up with an `EXEC-SUMMARY.md` instead of per-plan summaries — caused partial status in roadmap analyze
- Dashboard analytics (Phase 1002) was in the "Backlog" section of ROADMAP.md alongside active phases — caused confusing roadmap layout
- No PROJECT.md or REQUIREMENTS.md from the start — had to create them at milestone close

### Patterns Established

- `CardFooter pt-0` in shadcn cards removes spacing — always use `pt-4` when following CardContent
- Auth layouts need their own theme toggle since they strip the app header
- Always add `"use client"` to components that use hooks like `useTheme`, even if they seem "leaf" components

### Key Lessons

- Start every project with PROJECT.md and REQUIREMENTS.md to avoid scrambling at milestone close
- BFF stubs are a powerful pattern — ship a `501 + message` early, wire the UI, replace later
- UAT works best one test at a time — users will catch cosmetic bugs they'd otherwise forget to mention

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 4 |
| Plans | 8 |
| UAT pass rate | 100% (issues fixed inline) |
| Build passing | ✓ |
