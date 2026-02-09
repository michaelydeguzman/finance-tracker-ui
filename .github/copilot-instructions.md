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

- Group related files into folders (e.g., components, hooks, types, data)
- Keep files focused on a single responsibility
- Use index.ts files for barrel exports where appropriate
- Maintain a consistent file structure across the project
- Separate reusable components into a shared components folder
- Organize hooks into a dedicated hooks folder
- Store type definitions in a types folder
- Keep constant values in a constants or data folder
- Use clear and descriptive names for folders and files

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
