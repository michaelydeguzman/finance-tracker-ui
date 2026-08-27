/**
 * Shape-then-parse validation for ISO-8601 dates arriving from a request body
 * or a query string.
 *
 * Kept free of feature imports so both the transaction and recurring-template
 * route handlers can validate dates the same way — the regex is subtle enough
 * that a second copy would drift.
 */

/**
 * The shape is checked before parsing because `new Date()` accepts a lot of
 * loose input — `new Date("5")` is a valid date in V8 — which would send
 * nonsense through to the backend.
 */
const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/** Accepts a `Date` or an ISO-8601 date / date-time string. */
export function isIsoDateLike(value: unknown): value is string | Date {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string" || !ISO_DATE_RE.test(value.trim())) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

/** Normalizes a validated date input to an ISO-8601 string. */
export const toIsoString = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();
