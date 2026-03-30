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
