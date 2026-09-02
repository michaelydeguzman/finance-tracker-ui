# Finance Tracker UI

A modular, theme-aware UI for managing personal finances. Built with the Next.js App Router, modern React 19 features, and a layered design system that keeps layout, typography, and motion consistent across pages.

## Tech stack

- **Framework**: Next.js 15 App Router + React 19 + TypeScript
- **Styling**: Tailwind CSS v4, CSS custom properties, and `tw-animate-css`
- **Component primitives**: Radix UI + shadcn-inspired wrappers in `components/ui`
- **State & UX utilities**: `next-themes`, custom hooks in `hooks/`, and optimistic-list utilities
- **Data viz**: Recharts
- **Auth**: Auth.js (NextAuth v5) — Google, GitHub, email and password, or a magic link — over an encrypted session cookie carrying the API's access and refresh tokens

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

Sign-in is Auth.js (NextAuth v5), with four ways in: Google OAuth, email and
password, a magic link, and GitHub when `AUTH_GITHUB_ID` and
`AUTH_GITHUB_SECRET` are both set. The login page renders whatever is
configured.

Two layers enforce access, and they are not redundant:

1. **This app** — `auth.ts` and `middleware.ts` gate every page and every
   `/api/*` route. The exceptions are the signed-out account pages and
   `app/api/account/**`, which exist precisely for people who cannot sign in
   yet, so they gate themselves instead.
2. **The .NET API** — it authenticates and scopes by itself. It requires a
   bearer token and filters every query to that token's user, so reaching it
   directly no longer means reading everyone's finances. The BFF is no longer
   the only thing standing between the browser and the data.

`AUTH_SIGNUP_MODE` decides who may sign in:

- `allowlist` (the default) honours `AUTH_ALLOWED_EMAILS`. An empty list means
  nobody can sign in — fail-closed on purpose, and the login page says so rather
  than failing silently.
- `open` lets anyone register and get their own tenant.

Opening sign-up is a deliberate choice rather than a side effect of clearing a
variable.

The API's access and refresh tokens live in the encrypted session cookie and are
deliberately **absent from the session object**, so `/api/auth/session` never
serves them to the browser.

### Google OAuth setup

1. In [Google Cloud Console credentials](https://console.cloud.google.com/apis/credentials),
   create an OAuth client of type **Web application**.
2. Add the redirect URI `http://localhost:3000/api/auth/callback/google`
   (and the equivalent for each deployed host).
3. Put the client id and secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
4. Generate a session key with `npx auth secret` and set `AUTH_SECRET`.
5. Leave `AUTH_SIGNUP_MODE=allowlist` and list the permitted addresses in
   `AUTH_ALLOWED_EMAILS`, or set `AUTH_SIGNUP_MODE=open` to let anyone register.
6. Set `API_BFF_SECRET` to match `Auth:BffSharedSecret` in the API's
   user-secrets. It guards the SSO exchange endpoint, which mints a session from
   a provider subject rather than a credential — anything holding it can sign in
   as anyone.

## Getting started

```bash
npm install
cp .env.example .env         # base config; dev-only secrets go in .env.development.local
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

Set every variable from `.env.example` in the hosting platform before promoting a build — in particular `AUTH_SECRET`, the Google client credentials, `API_BFF_SECRET`, and — if you are not opening sign-up with `AUTH_SIGNUP_MODE=open` — `AUTH_ALLOWED_EMAILS`. Add the deployed callback URL (`https://<host>/api/auth/callback/google`) to the Google OAuth client. `NODE_TLS_REJECT_UNAUTHORIZED` must never be set outside local development.

## Contributing tips

- Follow the naming, structure, and styling conventions in [CLAUDE.md](CLAUDE.md), which is the single source of truth for conventions in this repo.
- Keep feature folders self-contained (components + data + hooks + types).
- Prefer barrel exports (`index.ts`) when sharing modules broadly.
- Do not create `components/common/` or `components/buttons/` — shared pieces go in `components/shared/`.
