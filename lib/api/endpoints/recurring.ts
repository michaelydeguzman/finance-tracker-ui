/**
 * Client-facing recurring-template endpoint constants.
 *
 * These are relative paths that hit Next.js API route handlers, which in turn
 * proxy requests to the real backend (API_URL).
 */
import type {
  RecurringStatus,
  RecurringTransition,
} from "@/lib/recurring-status";

export const RECURRING_ENDPOINTS = {
  /** GET / POST — list or create recurring templates. GET accepts `?status=`. */
  list: "/api/recurring-transactions",

  /** GET / PUT / DELETE — single template by ID. */
  byId: (id: string) => `/api/recurring-transactions/${id}` as const,

  /** POST — a state transition (`pause`, `resume`, `cancel`) on one template. */
  transition: (id: string, transition: RecurringTransition) =>
    `/api/recurring-transactions/${id}/${transition}` as const,

  /** GET — the frequencies a template can be scheduled on. */
  options: "/api/recurring-options",
} as const;

/** Builds the list URL, optionally narrowed to one status. */
export function recurringListUrl(status?: RecurringStatus): string {
  return status === undefined
    ? RECURRING_ENDPOINTS.list
    : `${RECURRING_ENDPOINTS.list}?status=${encodeURIComponent(status)}`;
}
