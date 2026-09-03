# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Finance Tracker UI** — Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui, with Auth.js
(NextAuth v5) for sign-in and Recharts for the dashboard. It is the front end for the sibling
`finance-tracker-api` repo (ASP.NET Core).

This file is the single source of truth for conventions in this repo.

## Running

```bash
npm run dev          # http://localhost:3000
npm run test         # vitest — no infrastructure required
npm run type-check   # tsc --noEmit
npm run lint
npm run format       # prettier --write .
npm run build
```

The dev server needs the .NET API running at `https://localhost:7203`. Without it, pages
render but data calls fail.

### What CI checks

`.github/workflows/ci.yml` runs on every pull request and every push to `main`. Its four
steps are `tsc --noEmit`, `npm run test`, `npm run lint`, then `npm run format:check`, each
guarded by `if: !cancelled()` so one push reports every problem at once rather than one per
re-run. `npm run build` is **not** in CI.

Run all four before pushing. `lint` and `format:check` have separate jurisdictions — ESLint
passing says nothing about whether Prettier is satisfied, and a formatting-only violation
will pass every other step and still fail the build:

```bash
npm run type-check && npm run test && npm run lint && npm run format:check
```

Fix formatting with `npm run format`, never by hand.

## Environment files are git-ignored

`.gitignore` ignores `.env*` and tracks only `.env.example`. A fresh clone or worktree has
**no** `API_URL`, `AUTH_SECRET`, Google OAuth credentials, or TLS bypass, and the app will not
boot until they exist.

- `.env` — base config (`API_URL`, `NEXT_PUBLIC_APP_URL`), ignored.
- `.env.development.local` — dev-only secrets plus `NODE_TLS_REJECT_UNAUTHORIZED=0`, which is
  what lets Node accept the .NET dev server's self-signed certificate. It must stay in this
  file so it can never reach a production build.
- Sign-in is Google OAuth, email-and-password, or a magic link, plus GitHub when
  `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are both set — `auth.ts` pushes that provider
  only if they exist. The sign-in page's SSO buttons come from `enabledProviders`, which
  resolves each provider's **configured** id via `summarizeProviders`: Auth.js parks user
  config under `.options` until core merges it, so reading `provider.id` directly yields the
  factory default and renders duplicate buttons. `AUTH_SIGNUP_MODE` decides
  who may sign in: `allowlist` (default) honours `AUTH_ALLOWED_EMAILS`, and an empty list means
  nobody can sign in — intentional fail-closed behavior, not a bug. `open` lets anyone
  register and get their own tenant.
- `API_BFF_SECRET` must match `Auth:BffSharedSecret` in the API's user-secrets. It guards the
  SSO exchange endpoint, which mints a session from a provider subject rather than a
  credential, so anything holding it can sign in as anyone.

Copy from `.env.example` when setting up a new checkout. Never commit real secrets.

## Backend-for-frontend boundary

Every page and `/api/*` route sits behind Auth.js (`auth.ts`, `middleware.ts`), except the
signed-out account pages and `app/api/account/**`, which people reach precisely because they
cannot sign in yet.

Route handlers under `app/api/**` proxy to the .NET backend, which now **authenticates and
scopes by itself**: it requires a bearer token and filters every query to that token's user.
The BFF is no longer the only thing standing between the browser and the data, but these
rules are still load-bearing:

- Export session-gated handlers through `defineRoute` from `lib/server/backend.ts`, never a
  bare `export async function GET`. The wrapper **is** the gate — it rejects the caller with no
  session, enforces the content type when `{ json: true }`, awaits `context.params`, and turns
  an unexpected throw into an opaque 500 labelled with the derived route. A handler cannot run
  without a `caller`, because that is the only way it is given one. Pass that `caller` to
  `callBackend`, which attaches the bearer token.
- Access and refresh tokens live in the encrypted session cookie and are read with
  `getToken`. They are deliberately **absent from the session object** — putting them there
  would serve them to the browser through `/api/auth/session`.
- Anything importing `lib/server/api-session.ts` is server-only; the module says so, so a
  stray client import is a build error rather than a leaked secret.
- Never forward a backend response body or exception message to the browser. Use
  `callBackend` / `routeError`, which log detail server-side and return a safe message.
- Validate every path segment and query value before it reaches a backend URL — `requireUuid`
  for `[id]` segments, `isCategoryType` / `parseCategoryType` for query values. Never
  interpolate raw request input. `requireUuid` builds a fresh `Response` per call on purpose:
  a body can only be consumed once, so a shared instance would be empty the second time.
- Use `apiFetch` from `lib/api/config.ts` on the client; it unwraps the API's
  `{ success, message, data }` envelope and bounces expired sessions to `/login`.

Households are session-gated like the rest, with one thing worth knowing: `GET
/api/households/me` answers **200 with a null body** for someone in no household. That is
the normal state for most accounts, not a miss, so do not turn it into a 404 — every caller
would then have to treat "you have no household" as a failure.

Two kinds of route handler live under `app/api/**`, and they are not interchangeable:

- **Session-gated** — `transactions`, `categories`, `recurring-transactions`,
  `recurring-options`. Every one is
  `export const GET = defineRoute(config, async ({ request, caller, params }) => …)`.
  `defineRoute` is declared as two overloads because Next type-checks what a route file
  exports: a static route's handler is called with the request alone, and one optional
  parameter covering both shapes is rejected as an invalid export — so annotate the params
  (`defineRoute<{ id: string }>`) on dynamic routes.
- **Deliberately session-less** — `app/api/account/**` (register, forgot-password,
  reset-password, verify-email, magic-link). These are reached by people who cannot sign in
  yet, so they take no session and must **gate themselves**: `account/register` re-checks
  `signupMode !== "open"` and answers 404, because hiding the `/register` page does not
  close the endpoint behind it.

  They also answer **identically whether or not the address exists** — the API emails the
  real owner rather than reporting the conflict. Do not add a more specific error message;
  that would undo the account-enumeration defense on both sides of the boundary.

One shared definition of "signed in": `resolveSessionError` in `lib/session-state.ts`. The
middleware, the sign-in page, the app shell, and the BFF all consult it, and a cookie
carrying a user but no API credentials must read as unusable in every one of them. When
those gatekeepers disagree the result is an infinite redirect — middleware sends the browser
to the dashboard, the dashboard's first fetch 401s, and `apiFetch` bounces it back to
`/login`.

The backend holds **real personal financial records**. Nothing here should generate bulk
writes or destructive calls against it.

## Client data layer

A feature's browser-side data access is four files in four places, and each has one job:

| Layer                   | Example                   | Job                                                                   |
| ----------------------- | ------------------------- | --------------------------------------------------------------------- |
| `lib/api/endpoints/*`   | `transactionListUrl`      | Builds the `/api/**` URL. Must mirror the BFF's own query validation. |
| `lib/api/<resource>.ts` | `lib/api/transactions.ts` | Calls `apiFetch`, maps wire shape to domain shape                     |
| `*.api.ts`              | `transaction.api.ts`      | Wire shapes — exactly what crosses the boundary                       |
| `*.model.ts`            | `transaction.model.ts`    | Domain types — `Date`, `number`, `CategoryType`                       |

The mapping step is load-bearing, not ceremony. The backend may serialize an enum as `0`,
`"0"` or `"Income"`, so `lib/api/transactions.ts` runs every row through `coerceCategoryType`
and `new Date(...)`; skip it and dashboard comparisons against `CategoryType` fail silently
rather than loudly. Components should see the model type, never the response type.

## Stack and type strictness

TypeScript runs strict, including `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`:

- Omit optional props rather than passing `undefined`.
- Narrow `unknown` errors before use.
- Index access is possibly-undefined — handle it, don't assert it away.

## File organization

Follow App Router conventions and co-locate route-specific code under `app/<route>/`:
`components/`, `hooks/`, `types/`, `data/`.

Three top-level folders under `app/`, only two of which are routes:

- `app/(app)/` — the signed-in shell. Dashboard (`page.tsx`), income, expenses, recurring,
  categories, households. Its `layout.tsx` provides the sidebar chrome and `error.tsx` is
  the error boundary for everything inside it.
- `app/(auth)/` — the signed-out pages: login, register, forgot-password, reset-password,
  verify-email, magic-link, with their forms in `app/(auth)/components/`.
- `app/transactions/` — **not a route.** It has no `page.tsx` by design; it holds the shared
  Income/Expenses implementation that `(app)/income/page.tsx` and `(app)/expenses/page.tsx`
  both render. Do not add a page here.

`routes.ts` is the sidebar's nav model, not the router — a page can exist without an entry,
and an entry can be marked `comingSoon`.

Shared code lives in `components/`:

| Folder                                | Contents                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `shared/`                             | Generic reusable UI — `Card`, `PageTitle`, `SortButton`, `ConfirmDeleteDialog` |
| `layout/`                             | Layout primitives — `PageWithSidebar`, `StickyRightSidebar`                    |
| `header/`, `dashboard/`, `household/` | Feature-area components                                                        |
| `ui/`                                 | shadcn/ui primitives                                                           |

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
- `PageTitle` renders its optional `subtitle` **below** the heading. Recurring and Household
  are its only two subtitle callers, so the order lives in the component rather than being
  worked around per page.
- The global `Toaster` must come from `@/components/ui/sonner` and sit **inside**
  `ThemeProvider` in `app/layout.tsx`, or `next-themes` won't apply correctly.
- Prefer semantic Tailwind tokens (`bg-background`, `text-foreground`, `text-muted-foreground`,
  `border-border`) over ad-hoc `gray-*` utilities. Use `cn()` for conditional classes.
- Avoid custom CSS classes; Tailwind utilities in JSX are the default.
- Format money through `DISPLAY_CURRENCY` in `constants.ts` and the helpers in
  `lib/currency.ts` — never a hardcoded currency or locale. The constant exists because the
  dashboard once rendered USD while the income and expense lists rendered CAD, so the same
  transaction looked like two different amounts depending on the page.
- **Income and Expenses share one implementation** —
  `app/transactions/components/transaction-page-client.tsx`, parameterized by `CategoryType`.
  Differences belong in `app/transactions/config/views.tsx`, never in a duplicated component tree.

## Households

A household is a group of people who share one set of financial records. The API widens its
own tenancy filter to admit them, so **income, expenses, recurring and the dashboard need no
household code at all** — they simply return more rows once you are in one.

- `HouseholdProvider` (`components/household/`) is mounted in `app/(app)/layout.tsx` and owns
  the shell's only copy of the household state; `useHousehold` reads it. It lives there rather
  than on the households page because `HouseholdBanner` names the household above every page's
  title while the households page rewrites that same state — two independent fetches would let
  the banner keep naming a household the user has just left.
- The banner exists because the widened filter is otherwise invisible: the dashboard just
  returns more rows, with nothing on screen to say whose money you are looking at. It renders
  nothing while loading and nothing for someone on their own.
- The `<main>` gap lives on an inner `div`, not on `<main>` itself, so the banner can sit
  close to the title while pages keep the spacing they were written against.
- Membership changes by invitation, never by adding someone: joining publishes the joiner's
  records to everyone already in the household, so it has to be their own answer.
- **One household per person**, checked in three places on purpose: the API is the authority
  (409), `oneHouseholdBlockedReason` stops the click in the provider, and the create and
  accept BFF routes rewrite that 409 into wording a user can act on. That last one is needed
  because `callBackend` replaces every backend body with a generic line — the replacement
  text is ours, so nothing is forwarded.
- `lib/household.ts` holds the validation rules, deliberately free of `fetch`, React and
  `server-only` so both the forms and the BFF routes can use them — and so they can be
  unit-tested. Both sides validate, and they have to agree: a name the form accepts and the
  route rejects is a submit button that silently does nothing.
- `useHousehold` refetches after every mutation rather than updating optimistically. Every
  action here changes who can see the money, and showing a member as removed before the
  server agrees would be a lie about access, not a cosmetic reorder.
- **Its mutations resolve to whether they worked**, and the forms clear only on `true`.
  Failures are reported as toasts and never thrown, so the promise settles either way —
  a form that cleared on submit threw away correct input on every rejected create, invite
  or rename, and the rename editor closed too, which reads as "saved" for a rename that did
  not happen. Keep the boolean if you touch these; awaiting alone does not tell you anything.

## Data loading and mutations

- Prefer Server Components for initial page data; keep client boundaries for interactivity,
  forms, and optimistic updates.
- **Never show an empty "no data" state while a fetch is still in flight.** Use route
  `loading.tsx`, `Spinner`, or `Skeleton`.
- For mutations use `hooks/use-optimistic-list.ts` — `useOptimistic` + `useTransition` with a
  `sonner` toast and rollback on failure. `use-sortable-data.ts` and `use-debounced-value.ts`
  are the other app-wide hooks. Validate before submit.
- Add error handling around user inputs and API calls, with actionable user feedback — not
  just `console.error`.

## Naming

- `PascalCase` — components, interfaces, type aliases
- `camelCase` — variables, functions, methods
- `ALL_CAPS` — constants
- No underscore prefix on private members

## Testing

Vitest suites live in `tests/` and cover pure logic (aggregates, validation, category types,
session state, provider resolution). They need no browser, network, or database, so they run
anywhere — including from a cloud session.

```bash
npm run test                             # vitest run
npm run test:watch
npx vitest run tests/currency.test.ts    # a single file
npx vitest run -t "resolves the id and name"   # a single case, by name
```

`vitest.config.ts` sets `environment: "node"` and aliases `server-only` to
`tests/stubs/server-only.ts`, because the real module throws when imported outside a Server
Component and would otherwise make every server module untestable. Two consequences worth
knowing before writing a test:

- There is no DOM, so components are not unit-tested here. Test the logic, not the JSX.
- Importing `@/auth` pulls in `next/server` and fails. To test something `auth.ts` does,
  extract the logic into a pure module first — `lib/auth-providers.ts` exists for exactly
  this reason.

The config also excludes `.claude/**`, which holds agent git worktrees — full checkouts of
this repo. Without that the suite runs twice, half of it against whatever branch the worktree
is on.

Add or update tests alongside behavior changes, with descriptive names stating the behavior
under test.

## Working in this repo

- Use the **Context7 MCP** for library/API documentation, setup, and configuration steps
  without waiting to be asked. `.vscode/mcp.json` declares the servers this repo expects:
  `context7`, `shadcn`, `chrome-devtools`, `next-devtools`, `react-aria-docs`.
- Prefer **small, reviewable diffs**. Avoid drive-by refactors and unrelated files.
- For non-trivial behavior changes, explain the plan briefly first, apply changes in
  reviewable steps, and run `npm run build` and/or `npm run test`, reporting the outcome.
- Explain the reasoning behind design decisions rather than just producing the diff.
- Ask a short clarifying question when a requirement is genuinely ambiguous.
- Reuse existing patterns and components before introducing new ones.
- Document components, hooks, and utilities with JSDoc where the intent isn't obvious.
- **Do not add unsolicited README files or long markdown docs** unless asked.
