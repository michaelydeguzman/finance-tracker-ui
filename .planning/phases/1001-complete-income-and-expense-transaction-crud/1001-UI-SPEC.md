# Phase 1001 — UI design contract

**Phase:** Complete income and expense transaction CRUD  
**Status:** Draft (planning aid)

## Screens / surfaces

- **`/income`** — Existing list + sidebar; each transaction row gains **Edit** and **Delete** affordances.
- **`/expenses`** — Same as income with expense styling tokens (`text-destructive` for amounts already present).

## Edit interaction

- Opens a **modal dialog** (shadcn `Dialog`) titled **Edit income** or **Edit expense** matching add-copy tone.
- Fields mirror **Add income/expense**: name, category (select), description (optional), amount, date.
- Primary action **Save**; secondary **Cancel** closes without save.
- Loading state on submit; success closes dialog; errors via **Sonner** toasts (same as add).

## Delete interaction

- **Delete** opens **AlertDialog** (add `components/ui/alert-dialog.tsx` if missing): title e.g. **Delete transaction?**, description includes transaction **name** and warning that action cannot be undone.
- Actions: **Cancel** (outline/secondary), **Delete** (destructive variant).
- On confirm: dialog closes, optimistic removal with error toast if API fails.

## Visual / a11y

- Row actions visible on hover or always visible on mobile — planner chooses; minimum focus-visible rings on interactive controls.
- Use semantic tokens (`border-border`, `text-muted-foreground`, `bg-card`) per Phase 1000; replace raw `hover:bg-gray-100` on touched rows with `hover:bg-muted/60` or equivalent token.

## Out of scope

- Bulk actions, swipe gestures, inline edit without dialog.
