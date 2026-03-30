# Technology Stack

**Analysis Date:** 2026-03-29

## Languages

**Primary:**
- TypeScript (5.x via `^5` in `package.json`) — all application code under `app/`, `components/`, `lib/`, `hooks/`, `types/`
- CSS — global styles and Tailwind v4 in `app/globals.css`

**Secondary:**
- JavaScript — minimal; PostCSS config only (`postcss.config.mjs`)
- MDX/Markdown — not used for app routes (docs may exist at repo root)

## Runtime

**Environment:**
- Node.js — required for Next.js; no `.nvmrc` or `.node-version` pinned in repo

**Package Manager:**
- npm — `package-lock.json` present at repo root

## Frameworks

**Core:**
- Next.js **15.4.5** (`package.json`) — App Router, API route handlers under `app/api/`
- React **19.1.0** with React DOM **19.1.0**
- Tailwind CSS **4.1.12** with `@tailwindcss/postcss` (`postcss.config.mjs`, `package.json`)

**UI / components:**
- Radix UI primitives (`@radix-ui/react-*` in `package.json`) — used by shadcn-style components under `components/ui/`
- shadcn/ui — configured via `components.json` (style: new-york, RSC, aliases to `@/components`, `@/lib/utils`)
- `class-variance-authority`, `clsx`, `tailwind-merge` — component variants and class composition
- `lucide-react` — icons
- `next-themes` — theme switching (`components/theme-provider.tsx` pattern)
- `recharts` — charts
- `sonner` — toasts (`app/layout.tsx`)

**Testing:**
- `package.json` scripts: `test`, `test:watch`, `test:coverage` invoke `jest`
- **Jest is not listed** in `dependencies` or `devDependencies` in `package.json`, and `jest.config.*` was not found — treat test runner setup as incomplete until Jest (or an alternative) is added

**Build/Dev:**
- `next dev --turbopack` — dev server (`package.json` `dev` script)
- ESLint via `next lint` — `eslint.config.mjs` extends `eslint-config-next` (**16.1.4**); note Next **15.4.5** vs eslint-config-next **16.1.4** version skew
- Prettier **3.8.1** — `format` / `format:check` scripts; no repo-root `.prettierrc*` found (defaults apply)
- `cross-env` — cross-platform env for `ANALYZE=true` in `analyze` script
- `@next/bundle-analyzer` **16.1.4** — dev dependency; `npm run analyze` sets `ANALYZE=true`; **`next.config.ts` does not wrap config with `withBundleAnalyzer`** — analyzer may need wiring to take effect
- `babel-plugin-react-compiler` — present in devDependencies; React Compiler enabled in `next.config.ts` `experimental.reactCompiler`
- `rimraf` — clean script

## Key Dependencies

**Critical:**
- `next`, `react`, `react-dom` — application shell and routing
- `typescript` — strict compilation; path alias `@/*` → project root (`tsconfig.json`)

**Infrastructure-style (frontend):**
- Native `fetch` in `lib/api/config.ts` and in `app/api/*/route.ts` — no axios or React Query in `package.json`

## Configuration

**Environment:**
- `.env` file **exists** at repo root — do not commit secrets; values are loaded by Next.js at build/runtime per Next conventions
- **Documented / observed variables** (from source only, not from reading `.env`):
  - `API_URL` — server-side base URL for backend; used in `app/api/transactions/route.ts`, `app/api/transactions/[id]/route.ts`, `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts`
  - `NEXT_PUBLIC_APP_URL` — optional; defaults to `http://localhost:3000` for `metadataBase` in `app/layout.tsx`
  - `NEXT_CANARY` — if set to `"true"`, enables experimental `ppr: "incremental"` in `next.config.ts`
  - `ANALYZE` — set by `npm run analyze` per `package.json` / README intent for bundle analysis

**Build:**
- `next.config.ts` — React Compiler, `optimizePackageImports` for `lucide-react`, `recharts`, `@radix-ui/react-avatar`, compression, image formats (WebP/AVIF), SVG CSP for `next/image`, TypeScript and ESLint enforced during builds
- `tsconfig.json` — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `moduleResolution: "bundler"`, `paths["@/*"]`

## Platform Requirements

**Development:**
- Node.js compatible with Next.js 15 and React 19
- npm install from repo root

**Production:**
- Typical target: Node-hosted Next.js (e.g. Vercel, container, or custom Node server); not defined in-repo

---

*Stack analysis: 2026-03-29*
