# Codebase Structure

**Analysis Date:** 2026-03-29

## Directory Layout

```
finance-tracker-ui/
├── app/                      # App Router: layouts, pages, API routes, feature colocation
│   ├── api/                  # Route Handlers (BFF → API_URL)
│   ├── categories/           # Categories route + components, hooks, data, types
│   ├── expenses/             # Expenses UI
│   ├── household(s)/         # Households UI
│   ├── income/               # Income UI
│   ├── transactions/         # Shared transaction UI (e.g. dialogs), hooks, types
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout (metadata, providers, shell)
│   ├── loading.tsx           # Route-level loading UI
│   └── page.tsx              # Dashboard (/)
├── components/               # Shared UI (not route-specific)
│   ├── dashboard/
│   ├── header/
│   ├── layout/               # PageWithSidebar, StickyRightSidebar
│   ├── shared/               # Card, PageTitle, AsyncBoundary, SortButton
│   ├── sidebar/
│   └── ui/                   # shadcn-style primitives
├── hooks/                    # Cross-feature hooks (use-optimistic-list, useSortableData, use-mobile)
├── lib/                      # Utilities and API client
│   ├── api/
│   │   ├── config.ts         # apiFetch
│   │   ├── endpoints/        # URL constants
│   │   ├── transactions.ts
│   │   └── categories.ts
│   └── utils.ts
├── types/                    # Shared TS types (app-wide)
├── routes.ts                 # Nav metadata ( consumed by header)
├── next.config.ts
├── tsconfig.json             # paths: "@/*" → repo root
└── package.json
```

## Directory Purposes

**`app/`:**

- Purpose: Next.js App Router entry, per-route UI, and **`app/api`** proxies.
- Contains: `page.tsx`, `layout.tsx` (only root layout in this repo), route colocated `components/`, `hooks/`, `data/`, `types/`.
- Key files: `app/layout.tsx`, `app/page.tsx`, `app/api/transactions/route.ts`, `app/api/categories/route.ts`

**`components/ui/`:**

- Purpose: Low-level, reusable primitives (Radix + Tailwind). Prescriptive: new generic widgets go here via shadcn patterns.
- Contains: `button.tsx`, `dialog.tsx`, `sidebar.tsx`, etc.
- Key files: `components/ui/sidebar.tsx`, `components/ui/dialog.tsx`

**`components/shared/` and `components/layout/`:**

- Purpose: Composite UI used across routes (not feature-specific).
- Key files: `components/shared/page-title.tsx`, `components/layout/page-with-sidebar.tsx`

**`lib/api/`:**

- Purpose: All browser-facing API calls target **`/api/*`** through typed functions; never embed `API_URL` here.
- Key files: `lib/api/config.ts`, `lib/api/endpoints/transactions.ts`, `lib/api/endpoints/categories.ts`

**`types/shared/`:**

- Purpose: Enums and shared DTO shapes (`ApiResponse`, frequency types).
- Key files: `types/shared/api-response.ts`, `types/shared/enums.ts`

**`hooks/` (root):**

- Purpose: Hooks used by multiple features (e.g. optimistic list).
- Key files: `hooks/use-optimistic-list.ts`

## Key File Locations

**Entry Points:**

- `app/layout.tsx`: Root layout, fonts, `ThemeProvider`, `SidebarProvider`, `Header`, `Toaster`
- `app/page.tsx`: Dashboard route
- `routes.ts`: Navigation config for `components/header/header.tsx`

**Configuration:**

- `next.config.ts`: React Compiler, image formats, strict TS/ESLint during builds
- `tsconfig.json`: `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, alias `@/*`
- `.env` / `.env.local` (if present): `API_URL`, `NEXT_PUBLIC_APP_URL` — do not commit secrets

**Core Logic:**

- `lib/api/config.ts`: `apiFetch`
- `app/api/*/route.ts`: proxy + validation

**Testing:**

- Jest configured via `package.json` scripts (`npm test`); test file discovery not heavily populated in current tree — add tests beside features or under `__tests__` per project convention when introduced.

## Naming Conventions

**Files:**

- Route segments: `page.tsx`, `layout.tsx`, `loading.tsx`
- React components: `PascalCase.tsx` (e.g. `expense-client.tsx` exports `ExpenseClient`)
- Hooks: `use-thing.ts` with `useThing` export
- Types/models: `*.model.ts`, `*.api.ts` under feature `types/`

**Directories:**

- App features: `app/<route>/` with optional `components/`, `hooks/`, `data/`, `types/`
- Kebab-case folder names for URL segments (`transactions`, `households`)

## Where to Add New Code

**New feature route:**

- Primary code: `app/<segment>/page.tsx` plus `app/<segment>/components/*`, `hooks/*`, `types/*`, `data/*` as needed.
- Keep **`components/ui/`** and **`components/shared/`** generic; put page-specific pieces under the route.

**New proxy endpoint:**

- Implementation: `app/api/<resource>/route.ts` or `app/api/<resource>/[id]/route.ts`
- Client: add functions in `lib/api/<resource>.ts` and constants in `lib/api/endpoints/<resource>.ts`, export from `lib/api/endpoints/index.ts` if using a barrel.

**New shared hook:**

- Cross-feature: `hooks/use-*.ts` at repo root.
- Feature-only: `app/<segment>/hooks/use-*.ts`

**Utilities:**

- Shared helpers: `lib/utils.ts` or small focused modules under `lib/`.

**Types:**

- Cross-cutting: `types/shared/` or `types/app.ts`
- Feature-specific: `app/<segment>/types/*`

## Special Directories

**`.next/`:**

- Purpose: Build output.
- Generated: Yes
- Committed: No (typical gitignore)

**`.planning/`:**

- Purpose: Planning and codebase reference docs (GSD).
- Generated: Mixed
- Committed: Per team policy; codebase mapper writes to `.planning/codebase/`

## Client vs Server Boundaries

**Default:** Files in `app/` without **`"use client"`** are **Server Components** (can use `async`, no browser hooks).

**Client boundaries:** Any file with **`"use client"`** and its imports must be client-safe (e.g. `components/theme-provider.tsx`, `components/header/header.tsx`, feature `*-client.tsx`, hooks under `app/*/hooks/` that use `useState`/`useEffect`, `hooks/use-optimistic-list.ts`).

**`lib/api/config.ts`:** No `"use client"` directive; it uses `fetch` and is safe to import from Client Components (called after mount/effects) or from Server Components if you intentionally run fetches on the server.

**`app/api/*/route.ts`:** Always **server**; uses `process.env.API_URL` and must not leak in client bundles.

**Prescriptive rule:** Do not import server-only secrets or Node-only modules into files that are part of a client bundle; keep `API_URL` usage confined to Route Handlers.

---

_Structure analysis: 2026-03-29_
