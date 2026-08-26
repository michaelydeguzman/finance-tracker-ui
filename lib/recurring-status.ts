/**
 * The lifecycle of a recurring template, and which actions each state allows.
 *
 * The API is the authority here — this module only mirrors its rules so the UI
 * never offers a button that is guaranteed to come back a 409. Keeping the table
 * in one pure module is what makes it testable, and what stops the rules being
 * re-derived (differently) in each menu that renders them.
 */

/**
 * String on the wire, unlike `FrequencyType` which is numeric. That asymmetry is
 * deliberate on the API side — each enum matches the format this front end
 * already receives for that concept — so it is preserved rather than normalized.
 */
export const RECURRING_STATUSES = ["Active", "Paused", "Cancelled"] as const;

export type RecurringStatus = (typeof RECURRING_STATUSES)[number];

export const isRecurringStatus = (value: unknown): value is RecurringStatus =>
  typeof value === "string" &&
  (RECURRING_STATUSES as readonly string[]).includes(value);

/**
 * Parses a status query value, case-insensitively, back to the exact casing the
 * API's enum binder expects. Returns `undefined` for absent or unrecognized
 * input so a caller can tell "no filter" from "bad filter".
 */
export function parseRecurringStatus(
  raw: string | null,
): RecurringStatus | undefined {
  if (raw === null) return undefined;

  const wanted = raw.trim().toLowerCase();
  if (wanted === "") return undefined;

  return RECURRING_STATUSES.find((status) => status.toLowerCase() === wanted);
}

/** Everything a row's menu can offer. `edit` opens the dialog; the rest are calls. */
export type RecurringAction = "edit" | "pause" | "resume" | "cancel" | "delete";

/** The state transitions that are their own endpoint rather than part of an edit. */
export const RECURRING_TRANSITIONS = ["pause", "resume", "cancel"] as const;

export type RecurringTransition = (typeof RECURRING_TRANSITIONS)[number];

export const isRecurringTransition = (
  value: unknown,
): value is RecurringTransition =>
  typeof value === "string" &&
  (RECURRING_TRANSITIONS as readonly string[]).includes(value);

/**
 * Which actions are worth offering for a template in a given state.
 *
 * - Cancelling is terminal: the API rejects editing, pausing or resuming a
 *   cancelled template, so none of those appear.
 * - Pause is hidden while already paused, and resume while already active —
 *   the API treats both as no-op successes, but a button that does nothing is
 *   still a button that lied.
 * - Delete stays available in every state. Whether it succeeds depends on
 *   something the list cannot see (whether the template has generated any
 *   transactions), so it is offered and the 409 is explained if it comes back.
 */
const ACTIONS_BY_STATUS: Record<RecurringStatus, readonly RecurringAction[]> = {
  Active: ["edit", "pause", "cancel", "delete"],
  Paused: ["edit", "resume", "cancel", "delete"],
  Cancelled: ["delete"],
};

export const availableActions = (
  status: RecurringStatus,
): readonly RecurringAction[] => ACTIONS_BY_STATUS[status];

export const isActionAvailable = (
  status: RecurringStatus,
  action: RecurringAction,
): boolean => ACTIONS_BY_STATUS[status].includes(action);
