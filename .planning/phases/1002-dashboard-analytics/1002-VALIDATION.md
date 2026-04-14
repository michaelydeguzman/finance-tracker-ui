---
phase: 1002
slug: dashboard-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 1002 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (script in `package.json`) |
| **Config file** | none — add `jest.config` only if introducing first tests during this milestone |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | &lt; 30 seconds (once tests exist) |

---

## Sampling Rate

- **After every task commit:** `npm run build` (mandatory for plan 01 tasks until `npm test` is green)
- **After plan 01 wave:** `npm run build` + manual steps in `1002-UAT.md`
- **Before `/gsd-verify-work`:** Build green; UAT scenarios in `1002-UAT.md` exercised
- **Max feedback latency:** rely on local dev server + backend optional

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1002-01-01 | 01 | 1 | list GET `from`/`to` | build | `npm run build` | ✅ | ⬜ pending |
| 1002-01-02 | 01 | 1 | client list query | build | `npm run build` | ✅ | ⬜ pending |
| 1002-01-03 | 01 | 1 | dashboard live + fallback | build + UAT | `npm run build` | ✅ | ⬜ pending |
| 1002-02-01 | 02 | 1 | extended list params | build | `npm run build` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- Existing infrastructure: **`npm run build`** is the primary automated gate for phase 1002.
- Optional future: unit tests for query-string builders in `app/api/transactions/common/utils.ts` and `lib/api/endpoints/transactions.ts`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live vs fallback messaging | D-02 | needs running Next + optional backend | See `1002-UAT.md` §1–§3 |
| Charts match totals for period | D-04–D-06 | visual + numeric sanity | See `1002-UAT.md` §4 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (`npm run build`) or explicit manual UAT
- [ ] Sampling continuity: build between tasks
- [ ] No watch-mode flags in phase verify steps
- [ ] `nyquist_compliant: true` only after automated tests cover list query helpers (optional)

**Approval:** pending
