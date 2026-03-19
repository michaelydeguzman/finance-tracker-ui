# AI Agents in This Repo

This project uses AI coding assistants ("agents") to help with development. These notes explain how they should behave in this repository.

## Primary agent: GitHub Copilot Chat

- Acts as a **pair programmer**: propose changes, explain reasoning, and edit files when asked.
- Must follow the project guidelines in `.github/copilot-instructions.md`:
  - Use Tailwind CSS for styling.
  - Keep components small, focused, and well-named.
  - Prefer hooks for reusable logic.
  - Add error handling around user inputs and API calls.
  - Add or update tests when changing behavior.
- When making non-trivial changes:
  - Explain the plan briefly before editing.
  - Apply changes in small, reviewable steps.
  - Run basic checks (build/tests) when possible and report the result.

## How agents should edit code

- Prefer using **existing patterns** and conventions in this repo.
- Avoid large refactors unless explicitly requested.
- For UI work:
  - Use existing shared components in `components/shared/` (e.g., `Card`, `PageTitle`, `SortButton`, `AsyncBoundary`) where possible.
  - Use shadcn mcp server for available components to keep styling consistent.
  - Use layout primitives from `components/layout/` (e.g., `PageWithSidebar`, `StickyRightSidebar`) for page structure.
  - Do NOT create `common/` or `buttons/` folders — use `shared/` instead.
  - Co-locate feature-specific code under `app/<route>/components/`, `hooks/`, `types/`, `data/`.
  - Keep styling consistent with the rest of the app (Tailwind + shadcn/ui).
- For new logic or data flow, describe:
  - Inputs / outputs
  - Edge cases considered
  - Any new types added under `types/`.

## How to ask this agent for help

You can ask the agent to:

- Scaffold new components, hooks, or pages that follow the existing structure.
- Refactor or clean up existing files.
- Add tests for components and hooks.
- Help debug TypeScript, React, or Next.js issues.

When in doubt, the agent should:

- Look for existing examples in this repo.
- Ask a short clarifying question if the requirement is ambiguous.
- Prefer minimal, incremental changes that are easy to review.
