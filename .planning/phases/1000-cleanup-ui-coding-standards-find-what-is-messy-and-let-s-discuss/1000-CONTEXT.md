# Phase 1000: Cleanup ui coding standards - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning (must-have decisions only; more areas can be appended later)

<domain>

## Phase Boundary

**Deliverable:** Documented and enforced **UI / React / styling / theming standards** for this repo—how we split server vs client, where code lives, how we use Tailwind tokens, and how theming ties to global UI (toasts)—then **implement** the highest-impact fixes (e.g. layout/toaster/theme order) in small, reviewable PRs.

**Out of scope (separate phases):** New product features (e.g. login), backend auth, full design refresh, chart theming overhaul.

</domain>

<decisions>

## Implementation Decisions (must-have bucket)

### React — server vs client boundary

- **D-01:** Prefer **Server Components by default** for `app/**/page.tsx`, layouts, and presentational trees. Add **`"use client"`** only when the file (or a lazily loaded child) needs React state, effects, browser-only APIs, or interactive primitives that require client hydration for the whole subtree.
- **D-02:** New interactive features should **minimize client surface**: wrap only the interactive leaf (e.g. dialog + form client component) inside server pages where possible.

### Architecture — where code lives

- **D-03:** **Route-specific** UI, hooks, types, and static data live under `app/<route>/components/`, `hooks/`, `types/`, `data/` respectively.
- **D-04:** **Cross-route reusable** UI (no route semantics) lives under `components/shared/` or `components/layout/` (structure primitives), never new `common/` or `buttons/` folders.
- **D-05:** **shadcn-style primitives** and design-system building blocks live under `components/ui/`. Extending or adding primitives is allowed; prefer matching existing shadcn patterns (`cn`, `data-slot`, Radix).

### Styling — Tailwind and tokens

- **D-06:** Prefer **semantic design tokens** from the theme: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-primary`, etc., over ad-hoc palette utilities (`bg-gray-100`, ` text-gray-600`) unless there is an explicit one-off visual reason.
- **D-07:** Merge conditional classes with **`cn()`** from `lib/utils.ts` (`clsx` + `tailwind-merge`); avoid unreadable ternary class string soup in JSX.

### Theming — next-themes + global feedback

- **D-08:** **`ThemeProvider`** (`components/theme-provider.tsx`) remains the single wrapper for `next-themes`; config stays driven from root layout (`attribute="class"`, `defaultTheme="light"`, `enableSystem`, `disableTransitionOnChange`) unless product asks otherwise.
- **D-09:** **Global toasts** must use **`Toaster` from `@/components/ui/sonner`** (not `import { Toaster } from "sonner"` in `app/layout.tsx`), so tokens and icons align with the design system.
- **D-10:** **`Toaster` must render inside `ThemeProvider`** so `useTheme()` in the Sonner wrapper resolves correctly. **Current bug:** `app/layout.tsx` places `<Toaster />` above `<ThemeProvider>`—planning/execution should **move `Toaster` inside** `ThemeProvider` (order: body → `ThemeProvider` → `Toaster` + app shell).
- **D-11:** If flash-of-incorrect-theme on hard refresh becomes an issue, follow the standard **`next-themes` + `suppressHydrationWarning` on `<html>`** pattern in root layout; add only when validating in browser.

### Claude's discretion

- Exact ESLint/Prettier rules to enforce token preference (warn vs error).
- Whether to add a short **internal STYLEGUIDE.md** vs only updating `.github/copilot-instructions.md` / `.cursor/rules` (prefer updating existing agent docs first; avoid duplicate long docs).

### Folded Todos

_None (todo match-phase returned none)._

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents should read these before planning or implementing.**

### Agent and project conventions

- `AGENTS.md` — agent behavior, `shared/` vs `layout/` vs `ui/`, co-location.
- `.github/copilot-instructions.md` — naming, Tailwind, shadcn, file layout (note: may still say “do not manually edit ui/”; **phase 1000 decisions override** for intentional primitive extensions).
- `.cursor/rules/finance-tracker-agents.mdc` — strict TS, API/toast patterns.
- `.cursor/rules/react-next-data-ui.mdc` — server-first loading patterns.

### Codebase map

- `.planning/codebase/CONVENTIONS.md` — current patterns and drift (hooks naming, etc.).
- `.planning/codebase/STRUCTURE.md` — directory layout.
- `.planning/codebase/CONCERNS.md` — known UI/API fragility.

### Implementation touchpoints for D-08–D-10

- `app/layout.tsx` — root shell, `ThemeProvider`, **fix Toaster import and order**.
- `components/theme-provider.tsx` — `next-themes` bridge.
- `components/ui/sonner.tsx` — themed `Toaster` implementation.

_No external PRD — requirements captured in decisions above._

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable assets

- `components/ui/sonner.tsx` — themed Sonner `Toaster` using CSS variables (`--popover`, `--border`, `--radius`).
- `components/theme-provider.tsx` — thin `NextThemesProvider` wrapper.
- `lib/utils.ts` — `cn()` for class merging.

### Established patterns

- App Router with **client feature** entrypoints like `*-client.tsx` under routes.
- Tailwind v4 + CSS variables in `app/globals.css` (semantic tokens).

### Integration points

- `app/layout.tsx` is the single root for theme + global toast; **must** compose `ThemeProvider` and `Toaster` correctly for theming to work end-to-end.

</code_context>

<specifics>

## Specific Ideas

- User asked to start with **must-have** bucket only; **should-have / nice-to-have** (loading consistency, `Button` vs raw `<button>`, chart dark mode, etc.) can be added in a follow-up discuss pass or a short addendum to this CONTEXT before planning.

</specifics>

<deferred>

## Deferred Ideas

- Remaining discuss items from earlier session: toast already decided here; **raw `<button>` vs `Button`**, **`"use client"` semicolon normalization**, **hooks file naming (`use-` vs camelCase)**, **copilot text about not editing `ui/`**.
- Broader **should-have** list: server fetch for initial lists, `AsyncBoundary` usage, chart theming, theme FOUC hardening beyond D-11.

### Reviewed Todos (not folded)

_None._

_None — backlog ideas above are intentionally deferred to keep phase 1000 focused._

</deferred>

---

*Phase: 1000-cleanup-ui-coding-standards*
*Context gathered: 2026-03-29*
