# Coding Conventions

**Analysis Date:** 2026-03-29

## Sources of truth (agents)

Executors and planners align with:

- `AGENTS.md` — Cursor rules path, Copilot expectations, shared vs layout vs `ui/`, co-location under `app/<route>/`.
- `.github/copilot-instructions.md` — naming, Tailwind/shadcn, imports, testing intent, JSDoc for public APIs.
- `.cursor/rules/finance-tracker-agents.mdc` — strict TypeScript bar (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`), prefer `lib/api/config.ts` (`apiFetch`), Sonner toasts for user feedback, small diffs.
- `.cursor/rules/react-next-data-ui.mdc` (applies to `app/`, `components/`, `hooks/`, `lib/`) — Server Components for initial data where practical; avoid empty “no data” during loading; use `loading.tsx` / spinners / skeletons; mutations: validate, dialogs/toasts not `alert()`/`confirm()`.

## Naming patterns

**Files:**

- Route segments and many feature files: kebab-case (e.g. `add-transaction-dialog.tsx`).
- Shared UI under `components/shared/`: kebab-case filenames (e.g. `async-boundary.tsx`, `sort-button.tsx`).
- shadcn primitives under `components/ui/`: kebab-case matching CLI output (e.g. `button.tsx`, `dialog.tsx`).
- App-wide hooks under `hooks/`: kebab-case with `use-` prefix (e.g. `use-optimistic-list.ts`, `useSortableData.ts` — mixed `use-` vs camelCase exists; prefer matching neighboring files in the same folder).

**Functions / variables:**

- camelCase per `.github/copilot-instructions.md`.

**Components / types:**

- PascalCase for React components and exported interfaces/types (e.g. `Button`, `OptimisticState` in `hooks/use-optimistic-list.ts`).

**Constants:**

- ALL_CAPS per `.github/copilot-instructions.md` when introducing true constants.

## TypeScript (strict)

**Config:** `tsconfig.json`

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`.

**Prescriptive rules for contributors:**

- On optional props, **omit** the property instead of passing `undefined` (satisfies `exactOptionalPropertyTypes`).
- After indexing (e.g. `arr[i]`, `record[k]`), narrow or handle `undefined` (`noUncheckedIndexedAccess`).
- Narrow `unknown` errors from boundaries and `catch` before displaying or logging sensitive details.

## Tailwind CSS

**Stack:** Tailwind **v4** via `@import "tailwindcss"` in `app/globals.css`, PostCSS plugin `@tailwindcss/postcss` in `postcss.config.mjs`.

**Patterns:**

- Prefer **utility classes** in JSX; tokens from `@theme inline` and CSS variables (e.g. `bg-primary`, `text-muted-foreground`).
- Compose conditional / merged classes with **`cn()`** from `lib/utils.ts` (`clsx` + `tailwind-merge`).
- Animation helpers: `tw-animate-css` imported in `app/globals.css`.
- Feature components use semantic layout utilities (flex, gap, responsive spacing) consistent with shadcn tokens.

**Avoid:**

- Custom CSS classes unless necessary; Copilot guidance discourages ad-hoc class names in favor of utilities.

## shadcn/ui

**Config:** `components.json` — style `new-york`, RSC + TSX, `tailwind.css` → `app/globals.css`, aliases `@/components`, `@/components/ui`, `@/lib/utils`, base color `neutral`, **lucide** icons.

**Location:** Primitives live in `components/ui/`. Variants use **class-variance-authority** (`cva`) with `cn()` (see `components/ui/button.tsx`).

**Prescriptive practice:**

- Add or update primitives with the **shadcn CLI** (`shadcn` is in `devDependencies`) so structure stays consistent; treat `components/ui/*` as the design-system layer and extend via `className` + `cn()` from feature code.
- Do not introduce `common/` or `buttons/`; use `components/shared/` for cross-feature UI.

## React / Next.js patterns

**Client hooks:**

- Files that use hooks or browser APIs start with **`"use client";`** (e.g. `hooks/use-optimistic-list.ts`).

**Server vs client:**

- Follow `react-next-data-ui.mdc`: server-first data where it fits; client for interactivity, forms, optimistic flows.

**Errors and feedback:**

- Pair **`apiFetch`** failures and mutation errors with user-visible feedback (**Sonner** `toast` — see `hooks/use-optimistic-list.ts`, feature clients under `app/*/`). `console.error` may supplement but is not sufficient alone.
- Reusable async UX: `components/shared/async-boundary.tsx` wraps `Suspense` + `react-error-boundary` with Tailwind-styled fallbacks.

**API client:**

- Prefer `apiFetch` in `lib/api/config.ts` for client calls to `app/api/*` handlers; it unwraps `ApiResponse<T>` from `types/shared/api-response`.

## Code style

**Formatting:**

- **Prettier** — `npm run format` / `format:check`; config `.prettierrc` is `{}` (defaults).

**Linting:**

- **ESLint** flat config: `eslint.config.mjs` spreads `eslint-config-next` only; `npm run lint` / `lint:fix`.
- `eslint-config-prettier` is present in `devDependencies` (avoid conflicting formatting rules when extending).

## Import organization

**Path alias:**

- `@/*` → repository root (`tsconfig.json` `paths`).

**Observed order (prescriptive target):**

1. External packages (`react`, `sonner`, `lucide-react`, etc.).
2. Internal `@/...` modules (`@/lib/utils`, `@/components/ui/...`, `@/hooks/...`).
3. Type-only imports may use `import type` (see `lib/api/config.ts`, `next.config.ts`).

**Barrel files:**

- `.github/copilot-instructions.md` mentions `index.ts` barrels; the repo currently has **no** `export * from` barrel files in scanned TS — prefer **direct imports** to stable paths unless a route introduces a barrel for a clear boundary.

## Comments and docs

**When to comment:**

- Copilio instructs: helpful comments for **complex logic**; JSDoc for **components, hooks, and utilities** intended for reuse.

**Observed:**

- Module-level JSDoc on `lib/api/config.ts` for `apiFetch` behavior and parameters.

## Function and module design

**Hooks:**

- Generic hooks export named functions and related types (e.g. `useOptimisticList`, `OptimisticState` in `hooks/use-optimistic-list.ts`).
- Keep side effects and transitions inside the hook; expose imperative methods (`addItem`, `updateItem`, …) for components.

**Components:**

- Small, focused components; compose shadcn primitives and `components/shared/*`.

**Exports:**

- Named exports are common for utilities and hooks; shadcn components re-export variants (e.g. `Button`, `buttonVariants` in `components/ui/button.tsx`).

---

*Convention analysis: 2026-03-29*
