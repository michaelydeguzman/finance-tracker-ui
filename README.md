# Finance Tracker UI

A modular, theme-aware UI for managing personal finances. Built with the Next.js App Router, modern React 19 features, and a layered design system that keeps layout, typography, and motion consistent across pages.

## Tech stack

- **Framework**: Next.js 15 App Router + React 19 + TypeScript
- **Styling**: Tailwind CSS v4, CSS custom properties, and `tw-animate-css`
- **Component primitives**: Radix UI + shadcn-inspired wrappers in `components/ui`
- **State & UX utilities**: `next-themes`, custom hooks in `hooks/`, and optimistic-list utilities
- **Data viz**: Recharts
- **Auth**: Auth.js (NextAuth v5) with Google SSO and a JWT session cookie

## Styling system

The project leans on Tailwind CSS 4 with a custom design token layer defined in `app/globals.css`. Keep these principles in mind when contributing to UI code:

1. **Design tokens first**
   - All surface, text, border, and chart colors live under `:root` and `.dark` declarations using OKLCH values for predictable contrast.
   - Tokens are promoted via `@theme inline` so Tailwind utilities like `bg-background` or `text-muted` resolve correctly.
   - If you need a new semantic color (e.g., warning), add the token to `globals.css`, mirror it inside the dark theme, and expose it via `@theme inline`.

2. **Dark mode is automatic**
   - The `ThemeProvider` in `components/theme-provider.tsx` wraps the app and relies on `next-themes` to add/remove the `.dark` class.
   - When building components, prefer semantic utilities (`bg-card`, `text-muted-foreground`, etc.) instead of hard-coded colors so both themes stay in sync.

3. **Component layers**
   - **UI primitives** (`components/ui/*`): low-level building blocks mapped over Radix UI (buttons, cards, dropdowns, tooltips). Extend these first when styling repeated patterns.
   - **Shared widgets** (`components/shared/*`, `components/layout/*`): ready-made shells like `PageTitle`, `Card`, `PageWithSidebar`, and `StickyRightSidebar` keep spacing and typography consistent. Compose these before adding bespoke flex/grid rules.
   - **Feature modules** (`app/**/components`): contain domain-specific styling. Keep Tailwind classes close to the JSX, limit inline styles, and rely on shared primitives for consistency.

4. **Spacing, radius, and motion**
   - Border radius tokens (`--radius`, `--radius-sm|md|lg|xl`) govern rounded corners. Use Tailwind utilities (`rounded-lg`, `rounded-xl`) instead of numeric values so tokens can evolve centrally.
   - Animate with `tw-animate-css` classes or CSS `@keyframes` declared next to the component; avoid ad-hoc inline animations.

5. **Utilities over custom CSS**
   - Reach for Tailwind utilities first. When variants or conditional styling is needed, use `clsx`/`cva` helpers and keep class strings tidy.
   - Reserve new CSS files for global concerns; component-level overrides should live in the component file via Tailwind.

### Adding a new styled component

1. Decide whether it belongs in `components/ui`, `components/shared`, or a feature folder.
2. Compose existing primitives (e.g., `Card`, `Button`) and extend with Tailwind utilities.
3. Export supporting types from `types/` or the feature’s `types` folder.
4. Document noteworthy props with JSDoc and add tests if logic goes beyond simple presentation.

## Project structure

```text
app/                # Route groups, feature pages, and collocated components/data/types
components/         # Shared primitives, layout shells, dashboards, modals, sidebar, etc.
hooks/              # Cross-cutting hooks (sorting, debounce, optimistic lists)
lib/                # API clients, server-only helpers (lib/server), utilities
types/              # Global TypeScript contracts
tests/              # Vitest suites for pure logic
auth.ts             # Auth.js configuration (providers, allowlist, session)
middleware.ts       # Route gate for pages and BFF routes
constants.ts        # Global constants leveraged across modules
```

## Authentication

Every page and every `/api/*` route requires a signed-in user. The Next.js app
is the only auth boundary — the .NET backend has none of its own, so the BFF
routes in `app/api/**` re-check the session before proxying.

Sign-in is Google SSO through Auth.js. Two things gate access:

1. **Identity** — Google proves who the visitor is.
2. **Authorization** — `AUTH_ALLOWED_EMAILS` decides who is allowed in. SSO on
   its own would let _any_ Google account reach the household ledger. With the
   list empty nobody can sign in; the login page says so rather than failing
   silently.

Adding a second provider (GitHub is wired up) only needs its env vars set; the
login page renders whatever is configured.

### Google OAuth setup

1. In [Google Cloud Console credentials](https://console.cloud.google.com/apis/credentials),
   create an OAuth client of type **Web application**.
2. Add the redirect URI `http://localhost:3000/api/auth/callback/google`
   (and the equivalent for each deployed host).
3. Put the client id and secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
4. Generate a session key with `npx auth secret` and set `AUTH_SECRET`.
5. List the permitted emails in `AUTH_ALLOWED_EMAILS`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the auth values
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the UI. The dev server uses Turbopack for faster HMR.

Local-only overrides live in `.env.development.local`, which Next.js loads only
when `NODE_ENV=development`. That is where `NODE_TLS_REJECT_UNAUTHORIZED=0`
belongs — the .NET dev server uses a self-signed certificate, and the flag
disables TLS verification for the whole process, so it must never sit in `.env`.

## Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run start` – serve the production build
- `npm run lint` / `lint:fix` – run ESLint (with optional auto-fix)
- `npm run type-check` – run TypeScript in no-emit mode
- `npm run test` / `test:watch` / `test:coverage` – run Vitest suites
- `npm run format` / `format:check` – format with Prettier
- `npm run analyze` – build with `ANALYZE=true` to inspect bundle size

## Testing & quality gates

Unit tests run on [Vitest](https://vitest.dev) and live in `tests/`. The suites
cover the pure logic — request validation, dashboard aggregation, date ranges,
and summary building — where a regression is silent and expensive.

When adding logic, include:

- A happy-path case
- At least one edge case (empty input, boundary date, rejected value)

Run `npm run test` before pushing, and ensure `npm run lint` + `npm run type-check` stay green.

## Deployment

Deploy to any Next.js-compatible platform (Vercel recommended). After `npm run build`, start the server with `npm run start`.

Set every variable from `.env.example` in the hosting platform before promoting a build — in particular `AUTH_SECRET`, the Google client credentials, and `AUTH_ALLOWED_EMAILS`. Add the deployed callback URL (`https://<host>/api/auth/callback/google`) to the Google OAuth client. `NODE_TLS_REJECT_UNAUTHORIZED` must never be set outside local development.

## Contributing tips

- Follow the naming, structure, and styling conventions described in `.github/copilot-instructions.md`.
- Keep feature folders self-contained (components + data + hooks + types).
- Prefer barrel exports (`index.ts`) when sharing modules broadly.
- Do not create `components/common/` or `components/buttons/` — shared pieces go in `components/shared/`.
