---
phase: 1001
slug: complete-income-and-expense-transaction-crud
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 1001 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (declared in `package.json`) |
| **Config file** | none — Wave 0 adds `jest.config` / Next integration if missing |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | TBD after Wave 0 |

---

## Sampling Rate

- **After every task commit:** `npm test` (when tests exist)
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** Full suite green
- **Max feedback latency:** 60 seconds (target)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1001-01-01 | 01 | 1 | TBD | manual / component | `npm test` | ❌ W0 | ⬜ pending |

*Planner will replace TBD rows after PLAN.md task IDs are fixed.*

---

## Wave 0 Requirements

- [ ] Jest config + at least one test file for transaction UI or validation helpers
- [ ] Document any manual-only steps in PLAN acceptance criteria

*If executor confirms existing infra: update rows to "Existing infrastructure covers requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---------------------|
| Edit + delete UX | D-01, D-02 | Browser interaction | On `/income` and `/expenses`, edit a row, save, refresh; delete with confirm and verify row gone |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or explicit manual steps
- [ ] `nyquist_compliant: true` set in frontmatter when complete

**Approval:** pending
