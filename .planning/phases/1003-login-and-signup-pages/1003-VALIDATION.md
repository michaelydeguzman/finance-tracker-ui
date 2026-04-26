---
phase: 1003
slug: login-and-signup-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 1003 — Validation strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (if configured in repo) |
| **Config file** | As in repo root / Next defaults |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~1–3 minutes |

---

## Sampling rate

- **After every task commit:** `npm run build`
- **After every plan wave:** `npm run build`
- **Before `/gsd-verify-work`:** `npm run build` green
- **Max feedback latency:** 180 seconds

---

## Per-task verification map

| Task ID | Plan | Wave | Requirement | Test type | Automated command | File exists | Status |
|---------|------|------|---------------|-----------|-------------------|-------------|--------|
| 1003-01-01 | 01 | 1 | D-04/D-05 | build | `npm run build` | — | ⬜ pending |
| 1003-02-01 | 02 | 1 | D-07/D-08 | build | `npm run build` | — | ⬜ pending |

---

## Wave 0 requirements

- [ ] Existing infrastructure: **`npm run build`** covers compile-time verification for new routes and handlers.

---

## Manual-only verifications

| Behavior | Requirement | Why manual | Test instructions |
|----------|-------------|------------|-------------------|
| Auth pages omit main Header | D-04/D-05 | Visual | Open `/login` and `/signup`; confirm no dashboard nav header strip from `(app)` layout. |
| Theme + toasts | D-03 | Visual | Toggle theme; trigger validation error; confirm Sonner appears bottom-center. |

---

## Validation sign-off

- [ ] All tasks have `<automated>` verify (`npm run build`) or documented manual steps
- [ ] Sampling continuity: no three consecutive tasks without automated verify
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter when complete

**Approval:** pending
