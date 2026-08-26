import type { RecurringStatus } from "@/lib/recurring-status";

const MS_PER_DAY = 86_400_000;

/**
 * Midnight local time. Comparing calendar days rather than instants is what
 * makes "due today" mean today, regardless of the time of day either date
 * carries.
 */
const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Whole days from `now` to `target`, negative in the past.
 *
 * Rounded rather than truncated so a DST shift — a 23- or 25-hour day — cannot
 * turn "tomorrow" into "today".
 */
export const daysUntil = (target: Date, now: Date): number =>
  Math.round(
    (startOfDay(target).getTime() - startOfDay(now).getTime()) / MS_PER_DAY,
  );

const plural = (count: number, unit: string): string =>
  `${count} ${unit}${count === 1 ? "" : "s"}`;

/**
 * The single most useful line on the screen: when the next transaction actually
 * appears.
 *
 * Deliberately relative and locale-independent — the absolute date is rendered
 * beside it, and a relative phrase is what answers "is this about to happen?".
 *
 * A paused or cancelled template shows no date at all. Its stored
 * `nextOccurrenceDate` is stale by design: pausing leaves the date where it is,
 * and resuming is what fast-forwards it, so showing it would promise a date the
 * template will not actually use.
 */
export function nextOccurrenceLabel(
  status: RecurringStatus,
  nextOccurrenceDate: Date,
  now: Date = new Date(),
): string {
  if (status === "Cancelled") return "No further occurrences";
  if (status === "Paused") return "Paused — nothing will be generated";

  const days = daysUntil(nextOccurrenceDate, now);

  if (days < 0) return `Overdue by ${plural(-days, "day")}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";

  return `Due in ${plural(days, "day")}`;
}

/** True when an active template's next occurrence is today or already passed. */
export const isDue = (
  status: RecurringStatus,
  nextOccurrenceDate: Date,
  now: Date = new Date(),
): boolean => status === "Active" && daysUntil(nextOccurrenceDate, now) <= 0;

/** `<input type="date">` wants `YYYY-MM-DD` in local time, not an ISO instant. */
export const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
