# Finance Tracker UI

A modular, theme-aware UI for managing personal finances. Built with the Next.js App Router, modern React 19 features, and a layered design system that keeps layout, typography, and motion consistent across pages.

## Tech stack

- **Framework**: Next.js 15 App Router + React 19 + TypeScript
- **Styling**: Tailwind CSS v4, CSS custom properties, and `tw-animate-css`
- **Component primitives**: Radix UI + shadcn-inspired wrappers in `components/ui`
- **State & UX utilities**: `next-themes`, custom hooks in `hooks/`, and optimistic-list utilities
- **Data viz**: Recharts

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
   - **Common layout widgets** (`components/common/*`, `components/layout/*`): ready-made shells like `PageTitle`, `Card`, `PageWithSidebar`, and `StickyRightSidebar` keep spacing and typography consistent. Compose these before adding bespoke flex/grid rules.
   - **Feature modules** (`app/**/components` and `components/templates/**`): contain domain-specific styling. Keep Tailwind classes close to the JSX, limit inline styles, and rely on shared primitives for consistency.

4. **Spacing, radius, and motion**
   - Border radius tokens (`--radius`, `--radius-sm|md|lg|xl`) govern rounded corners. Use Tailwind utilities (`rounded-lg`, `rounded-xl`) instead of numeric values so tokens can evolve centrally.
   - Animate with `tw-animate-css` classes or CSS `@keyframes` declared next to the component; avoid ad-hoc inline animations.

5. **Utilities over custom CSS**
   - Reach for Tailwind utilities first. When variants or conditional styling is needed, use `clsx`/`cva` helpers and keep class strings tidy.
   - Reserve new CSS files for global concerns; component-level overrides should live in the component file via Tailwind.

### Adding a new styled component

1. Decide whether it belongs in `components/ui`, `components/common`, or a feature folder.
2. Compose existing primitives (e.g., `Card`, `Button`) and extend with Tailwind utilities.
3. Export supporting types from `types/` or the feature’s `types` folder.
4. Document noteworthy props with JSDoc and add tests if logic goes beyond simple presentation.

## Project structure

```text
app/                # Route groups, feature pages, and collocated components/data/types
components/         # Shared primitives, layout shells, dashboards, modals, sidebar, etc.
hooks/              # Cross-cutting hooks (mobile detection, sorting, optimistic lists)
lib/                # Utilities + server actions (e.g., category actions)
types/              # Global TypeScript contracts
constants.ts        # Global constants leveraged across modules
```

## Getting started

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the UI. The dev server uses Turbopack for faster HMR.

## Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run start` – serve the production build
- `npm run lint` / `lint:fix` – run ESLint (with optional auto-fix)
- `npm run type-check` – run TypeScript in no-emit mode
- `npm run test` / `test:watch` / `test:coverage` – run Jest suites
- `npm run format` / `format:check` – format with Prettier
- `npm run analyze` – build with `ANALYZE=true` to inspect bundle size

## Testing & quality gates

Unit tests (Jest + React Testing Library) live next to the components they exercise. When adding new logic-heavy components or hooks, include:

- A happy-path render test
- At least one edge case (empty state, error path, etc.)

Run `npm run test` before pushing, and ensure `npm run lint` + `npm run type-check` stay green.

## Deployment

Deploy to any Next.js-compatible platform (Vercel recommended). After `npm run build`, start the server with `npm run start`. Ensure the `NEXT_PUBLIC_…` env vars required by API calls are configured in the hosting platform before promoting a build.

## Contributing tips

- Follow the naming, structure, and styling conventions described in `.github/copilot-instructions.md`.
- Keep feature folders self-contained (components + data + hooks + types).
- Prefer barrel exports (`index.ts`) when sharing modules broadly.
- Document architectural decisions in `REORGANIZATION_SUMMARY.md` when restructuring larger areas of the app.
