/** UUID string (8-4-4-4-12 hex), case-insensitive. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Kept free of server-only imports so route handlers, and tests, can use it
 * without pulling in the auth stack.
 */
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_RE.test(value);
