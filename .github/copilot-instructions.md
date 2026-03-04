# Project general coding guidelines

## AI Assistance

- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
- Ask user for clarification if the request is ambiguous or lacks necessary details before providing an answer.
- Do step by step changes and ask user to verify each step before proceeding to the next one, especially for complex code modifications or when refactoring existing code.
- Provide explanations for any code changes or design decisions I recommend, so the user can understand the rationale behind them and learn from the process.

## Naming Conventions

- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Prefix private class members with underscore (\_)
- Use ALL_CAPS for constants

## Code Quality

- Use meaningful variable and function names that clearly describe their purpose
- Include helpful comments for complex logic
- Add error handling for user inputs and API calls

## Styling

- Use Tailwind CSS for styling components

## File Organization

- Follow Next.js App Router conventions: co-locate feature-specific code under `app/<route>/`
  - `_components/` — route-specific components
  - `_hooks/` — route-specific hooks
  - `_types/` — route-specific type definitions
  - `_data/` — route-specific constants and mock data
- Place shared/reusable components in `components/` using these sub-folders:
  - `shared/` — generic, reusable UI components used across multiple features (e.g., `Card`, `PageTitle`, `SortButton`, `AsyncBoundary`)
  - `layout/` — layout primitives used to structure pages (e.g., `PageWithSidebar`, `StickyRightSidebar`)
  - `header/` — app header components
  - `sidebar/` — app sidebar components
  - `dashboard/` — dashboard-specific components
  - `ui/` — shadcn/ui auto-generated primitives (do not manually edit)
- Do NOT create a `common/` or `buttons/` folder; use `shared/` instead
- Keep files focused on a single responsibility
- Use `index.ts` files for barrel exports where appropriate
- Maintain a consistent file structure across the project
- Organize hooks into a dedicated `hooks/` folder (for app-wide hooks) or `_hooks/` (for feature-specific hooks)
- Store type definitions in `types/` (app-wide) or `_types/` (feature-specific)
- Keep constant values in `_data/` folders co-located with their feature

## Import Statements

- Use absolute imports for project files when possible
- Use relative imports for files within the same folder
- Group import statements by external libraries, project files, and styles
- Maintain consistent import order (e.g., libraries first, then project files, then styles)

## Testing

- Write unit tests for all components and hooks
- Use descriptive test names that reflect the functionality being tested
- Aim for high test coverage, especially for critical components and logic
- Use testing libraries like Jest and React Testing Library

## Documentation

- Document components, hooks, and utility functions with JSDoc comments
- Maintain a project README with setup instructions, usage guidelines, and contribution rules
- Keep documentation up to date with code changes

## Recommend Design Patterns and Decisions

- Recommend design patterns and strategy changes that will improve code quality, maintainability, or performance
- Follow Next.js best practices for file structure and routing
- Utilize React hooks effectively for state management and side effects
- Optimize performance with memoization and lazy loading where appropriate
