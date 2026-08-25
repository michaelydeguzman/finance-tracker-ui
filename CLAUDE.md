# Finance Tracker UI

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui, with Auth.js
(NextAuth v5) for sign-in and Recharts for the dashboard. It is the front end for the sibling
`finance-tracker-api` repo (ASP.NET Core).

This file is the single source of truth for conventions in this repo.

## Running

```bash
npm run dev          # http://localhost:3000
npm run test         # vitest — no infrastructure required
npm run type-check   # tsc --noEmit
npm run lint
npm run build
```

The dev server needs the .NET API running at `https://localhost:7203`. Without it, pages
render but data calls fail.

## Environment files are git-ignored

`.gitignore` ignores `.env*` and tracks only `.env.example`. A fresh clone or worktree has
**no** `API_URL`, `AUTH_SECRET`, Google OAuth credentials, or TLS bypass, and the app will not
boot until they exist.

- `.env` — base config (`API_URL`, `NEXT_PUBLIC_APP_URL`), ignored.
- `.env.development.local` — dev-only secrets plus `NODE_TLS_REJECT_UNAUTHORIZED=0`, which is
  what lets Node accept the .NET dev server's self-signed certificate. It must stay in this
  file so it can never reach a production build.
- Sign-in is Google OAuth gated by an `AUTH_ALLOWED_EMAILS` allowlist. Empty means nobody can
  sign in — intentional fail-closed behavior, not a bug.

Copy from `.env.example` when setting up a new checkout. Never commit real secrets.

## Backend-for-frontend boundary

Every page and `/api/*` route sits behind Auth.js (`auth.ts`, `middleware.ts`). Route handlers
under `app/api/**` proxy to the .NET backend, which **has no auth of its own** — this is the
security seam, so these rules are load-bearing rather than stylistic:

- Call `requireSession()` from `lib/server/backend.ts` before proxying anything.
- Never forward a backend response body or exception message to the browser. Use
  `callBackend` / `routeError`, which log detail server-side and return a safe message.
- Validate every path segment and query value before it reaches a backend URL (`isUuid`,
  `isCategoryType`). Never interpolate raw request input.
- Use `apiFetch` from `lib/api/config.ts` on the client; it unwraps the API's
  `{ success, message, data }` envelope and bounces expired sessions to `/login`.

The backend holds **real personal financial records**. Nothing here should generate bulk
writes or destructive calls against it.

## Stack and type strictness

TypeScript runs strict, including `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`:

- Omit optional props rather than passing `undefined`.
- Narrow `unknown` errors before use.
- Index access is possibly-undefined — handle it, don't assert it away.

## File organization

Follow App Router conventions and co-locate route-specific code under `app/<route>/`:
`components/`, `hooks/`, `types/`, `data/`.

Shared code lives in `components/`:

| Folder                  | Contents                                                                       |
| ----------------------- | ------------------------------------------------------------------------------ |
| `shared/`               | Generic reusable UI — `Card`, `PageTitle`, `SortButton`, `ConfirmDeleteDialog` |
| `layout/`               | Layout primitives — `PageWithSidebar`, `StickyRightSidebar`                    |
| `header/`, `dashboard/` | Feature-area components                                                        |
| `ui/`                   | shadcn/ui primitives                                                           |

- **Do not create `common/` or `buttons/` folders** — use `shared/`.
- Prefer the shadcn CLI (or its MCP server) to add `ui/` primitives. Manual edits are fine
  when they match existing patterns: `cn()` from `lib/utils`, `data-slot` attributes, Radix usage.
- App-wide hooks in `hooks/`, app-wide types in `types/`.
- Absolute imports for project files, relative within a folder. Group imports: libraries,
  then project files, then styles.

## UI conventions

- **Server Components by default** for `app/**` pages and layouts. Reach for `"use client"`
  only when a module needs hooks, effects, browser APIs, or an interactive subtree — and keep
  the client surface small (e.g. a route-level `*-client.tsx` wrapper).
- **Never use `alert()`, `confirm()`, or `prompt()`.** Use `sonner` toasts for messages and
  `ConfirmDeleteDialog` for destructive confirmation.
- For error states use the route-group boundary `app/(app)/error.tsx`, not a bespoke wrapper.
- The global `Toaster` must come from `@/components/ui/sonner` and sit **inside**
  `ThemeProvider` in `app/layout.tsx`, or `next-themes` won't apply correctly.
- Prefer semantic Tailwind tokens (`bg-background`, `text-foreground`, `text-muted-foreground`,
  `border-border`) over ad-hoc `gray-*` utilities. Use `cn()` for conditional classes.
- Avoid custom CSS classes; Tailwind utilities in JSX are the default.
- **Income and Expenses share one implementation** —
  `app/transactions/components/transaction-page-client.tsx`, parameterized by `CategoryType`.
  Differences belong in `app/transactions/config/views.tsx`, never in a duplicated component tree.

## Data loading and mutations

- Prefer Server Components for initial page data; keep client boundaries for interactivity,
  forms, and optimistic updates.
- **Never show an empty "no data" state while a fetch is still in flight.** Use route
  `loading.tsx`, `Spinner`, or `Skeleton`.
- For mutations, follow existing hook patterns (e.g. optimistic lists). Validate before submit.
- Add error handling around user inputs and API calls, with actionable user feedback — not
  just `console.error`.

## Naming

- `PascalCase` — components, interfaces, type aliases
- `camelCase` — variables, functions, methods
- `ALL_CAPS` — constants
- No underscore prefix on private members

## Testing

Vitest suites live in `tests/` and cover pure logic (aggregates, validation, category types).
They need no browser, network, or database, so they run anywhere — including from a cloud
session. Run `npm run test`.

Add or update tests alongside behavior changes, with descriptive names stating the behavior
under test.

## Working in this repo

- Use the **Context7 MCP** for library/API documentation, setup, and configuration steps
  without waiting to be asked.
- Prefer **small, reviewable diffs**. Avoid drive-by refactors and unrelated files.
- For non-trivial behavior changes, explain the plan briefly first, apply changes in
  reviewable steps, and run `npm run build` and/or `npm run test`, reporting the outcome.
- Explain the reasoning behind design decisions rather than just producing the diff.
- Ask a short clarifying question when a requirement is genuinely ambiguous.
- Reuse existing patterns and components before introducing new ones.
- Document components, hooks, and utilities with JSDoc where the intent isn't obvious.
- **Do not add unsolicited README files or long markdown docs** unless asked.
