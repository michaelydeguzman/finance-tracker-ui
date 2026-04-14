# Testing Patterns

**Analysis Date:** 2026-03-29

## Test framework (declared vs actual)

**Scripts in `package.json`:**

```bash
npm test              # runs `jest`
npm run test:watch   # `jest --watch`
npm run test:coverage # `jest --coverage`
```

**Current state:**

- **`jest` is not listed in `dependencies` or `devDependencies`** in `package.json`. Running `npm test` invokes `jest` on the PATH and **fails** (`jest` not recognized) in a typical clean install.
- **No Jest config file** (e.g. `jest.config.ts`, `jest.config.js`) and **no `jest.setup.*`** were found in the repository.
- **No test files** matching `*.test.*` or `*.spec.*` under the project root; **no** `describe(` / `@testing-library` / `jest.` usage in `*.ts` / `*.tsx` source.

**Conclusion:** Testing is **documented as desired** (see below) but **not implemented or installable** from the current manifest.

## Intended approach (from project docs)

**`.github/copilot-instructions.md`:**

- Write unit tests for components and hooks.
- Descriptive test names; high coverage for critical logic.
- Use **Jest** and **React Testing Library**.

**`AGENTS.md` / `.cursor/rules/finance-tracker-agents.mdc`:**

- Add or update tests when changing behavior; run **`npm test`** for non-trivial changes when possible.

## Recommended bootstrap (for executors)

When adding tests, align with Next.js 15 + React 19 + TypeScript:

1. **Install** (example set — versions should match repo policy when added):
   - `jest`, `jest-environment-jsdom`
   - `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
   - `ts-jest` or use Jest with `next/jest` if adopting Vercel’s documented pattern for Next.js.

2. **Add** `jest.config.*` at repo root:
   - Map `@/` to `<rootDir>/` consistent with `tsconfig.json`.
   - Use `jsdom` for component tests; set `testEnvironment` accordingly.
   - Optional: `setupFilesAfterEnv` pointing to a file that imports `@testing-library/jest-dom`.

3. **Co-locate or centralize tests** (pick one convention and document it in-tree):
   - **Co-located:** `component.test.tsx` next to the component, or
   - **`__tests__/`** per route or under `components/`.

4. **Naming:** `*.test.ts` / `*.test.tsx` (or `*.spec.*`) as already implied by Copilot instructions.

## Test file organization (target)

**Location:**

- Feature code lives under `app/<route>/components/`, `hooks/`, etc. — mirror that with tests alongside or under a dedicated `__tests__` tree.

**Naming:**

- `feature-name.test.tsx` for components; `use-feature-name.test.ts` for hooks.

**Structure (illustrative pattern to adopt):**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("FeatureName", () => {
  it("describes behavior in plain language", async () => {
    const user = userEvent.setup();
    render(<FeatureName />);
    // assert on screen / user flows
  });
});
```

## Mocking

**Framework:** To be chosen when Jest is added (Jest built-in mocks + RTL queries).

**Prescriptive guidance:**

- **Mock** `fetch` or wrap `apiFetch` tests where handlers are not running; prefer testing components with **msw** or route-level integration if the team adds it later.
- **Do not mock** trivial presentational wrappers unless it reduces flakiness; test user-visible outcomes.

## Fixtures and factories

**Current:** None in repo.

**Guidance:** Place shared factories under something like `test/factories/` or co-located helpers only if duplication grows.

## Coverage

**Requirements:** None enforced in CI from scanned configs.

**When added:**

```bash
npm run test:coverage
```

Document any threshold in `jest.config` or CI only after stakeholders agree.

## Test types

**Unit tests:**

- Hooks (`hooks/*.ts`), pure utilities (`lib/**`), and isolated components.

**Integration:**

- Optional: pages with data loading — may require Next.js test harness or Playwright later (not present).

**E2E:**

- Not detected; add only if product asks (e.g. Playwright).

## Common patterns (async and errors)

**Async testing:**

- Use RTL `findBy*` queries and `userEvent` for interactions; wrap async state updates in `await waitFor(...)` when needed.

**Error testing:**

- Assert error UI from `AsyncBoundary` or toast callbacks by mocking failures of `apiFetch` / server actions once those layers are test-mounted.

---

_Testing analysis: 2026-03-29_
