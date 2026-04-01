# Roadmap

## Current milestone

### Phase 1000: Cleanup ui coding standards. Find what is messy and let's discuss

**Goal:** Must-have standards locked: server/client boundaries, feature colocation, semantic Tailwind tokens, theming + Toaster (shadcn wrapper inside ThemeProvider). Implement fixes and align docs.
**Requirements:** See `1000-CONTEXT.md` (must-have); extend later for should-have/nice-have.
**Depends on:** (none)
**Plans:** 2 plans

Plans:
- [x] `1000-01-PLAN.md` — Root shell: ThemeProvider + `@/components/ui/sonner`
- [x] `1000-02-PLAN.md` — Agent docs: copilot-instructions + `finance-tracker-agents.mdc`

### Phase 1001: Complete income and expense transaction CRUD

**Goal:** Expose full CRUD on `/income` and `/expenses`: users can **edit** existing transactions and **delete** with an explicit confirmation step, using existing `lib/api/transactions` + `useTransactions` optimistic updates and shadcn/ui patterns.
**Requirements:** TBD
**Depends on:** (none)
**Plans:** 2 plans

Plans:
- [x] `1001-01-PLAN.md` — Transaction PUT/DELETE API parity (category pattern) + AlertDialog + hook + edit/delete shared components
- [x] `1001-02-PLAN.md` — Income/expense lists + clients wiring

## Backlog

### Phase 999.1: Implement login (BACKLOG)

**Goal:** Captured for future planning — user authentication / login flow for the finance tracker.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 1002: Dashboard analytics: bar (income, expenses, savings), pie (expense/income by category), monthly averages, period presets + custom range; mock data from Transaction model first; API query-param filtering assumed later

**Goal:** Dashboard with bar (income, expenses, savings), pies (income/expense by category), monthly averages, and period presets + custom range; mock `Transaction` data first; future API filters via query params.
**Requirements:** See `1002-CONTEXT.md` in phase directory
**Depends on:** Phase 1001
**Plans:** 2 plans

Plans:
- [ ] `1002-01-PLAN.md` — Verify mock dashboard vs CONTEXT + UAT doc
- [ ] `1002-02-PLAN.md` — Deferred API query-param contract + client URL builder
