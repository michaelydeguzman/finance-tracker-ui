import type { RecurringStatus } from "@/lib/recurring-status";
import type { RecurringTransaction } from "../types/recurring.model";
import { nextOccurrenceLabel } from "./recurring-schedule";

export interface RecurringSummaryItem {
  label: string;
  value: string;
}

const countByStatus = (
  templates: RecurringTransaction[],
  status: RecurringStatus,
): number => templates.filter((template) => template.status === status).length;

/**
 * The soonest-due active template, or `null` when nothing is scheduled.
 *
 * Only `Active` templates are considered: a paused or cancelled one has a
 * `nextOccurrenceDate` that will never be used as-is.
 */
export const nextDueTemplate = (
  templates: RecurringTransaction[],
): RecurringTransaction | null =>
  templates
    .filter((template) => template.status === "Active")
    .reduce<RecurringTransaction | null>(
      (soonest, template) =>
        soonest === null ||
        template.nextOccurrenceDate.getTime() <
          soonest.nextOccurrenceDate.getTime()
          ? template
          : soonest,
      null,
    );

/** Sidebar figures: how many templates are running, and what happens next. */
export const buildRecurringSummary = (
  templates: RecurringTransaction[],
  now: Date = new Date(),
): RecurringSummaryItem[] => {
  const soonest = nextDueTemplate(templates);

  return [
    { label: "Active", value: String(countByStatus(templates, "Active")) },
    { label: "Paused", value: String(countByStatus(templates, "Paused")) },
    {
      label: "Next up",
      value: soonest === null ? "Nothing scheduled" : soonest.name,
    },
    {
      label: "When",
      value:
        soonest === null
          ? "—"
          : nextOccurrenceLabel(
              soonest.status,
              soonest.nextOccurrenceDate,
              now,
            ),
    },
  ];
};

/**
 * Sorts by what is about to happen, mirroring the API's own ordering so the
 * list looks the same before and after a refetch.
 *
 * Anything not `Active` sorts last: its next occurrence is not a date the
 * template will actually use, so ordering by it would be noise.
 */
export const byNextOccurrence = (
  a: RecurringTransaction,
  b: RecurringTransaction,
): number => {
  const aActive = a.status === "Active";
  const bActive = b.status === "Active";

  if (aActive !== bActive) return aActive ? -1 : 1;
  if (!aActive) return a.name.localeCompare(b.name);

  const difference =
    a.nextOccurrenceDate.getTime() - b.nextOccurrenceDate.getTime();

  return difference !== 0 ? difference : a.name.localeCompare(b.name);
};
