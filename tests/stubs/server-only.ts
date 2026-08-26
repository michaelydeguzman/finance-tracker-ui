/**
 * Stand-in for the `server-only` package under Vitest.
 *
 * The real module throws on import outside a React Server Component, which is the point of
 * it — but that also blocks unit tests of server modules. Aliased here so the guard keeps
 * protecting the app build while the tests can still reach the code.
 */
export {};
