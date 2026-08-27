import { describe, expect, it } from "vitest";
import {
  buildRecurringSummary,
  byNextOccurrence,
  nextDueTemplate,
} from "@/app/(app)/recurring/data/recurring-data";
import {
  daysUntil,
  isDue,
  nextOccurrenceLabel,
  toDateInputValue,
} from "@/app/(app)/recurring/data/recurring-schedule";
import {
  describeFrequency,
  isSelectableFrequency,
  selectableFrequencies,
} from "@/app/(app)/recurring/data/frequency-options";
import type { FrequencyOption } from "@/app/(app)/recurring/types/frequency.model";
import type { RecurringTransaction } from "@/app/(app)/recurring/types/recurring.model";
import type { RecurringStatus } from "@/lib/recurring-status";
import { CategoryType, FrequencyType } from "@/types/shared/enums";

/** Local-time construction throughout, so the suite is timezone-independent. */
const at = (year: number, month: number, day: number, hour = 0): Date =>
  new Date(year, month - 1, day, hour);

/**
 * Runs a block with the process pinned to a given zone.
 *
 * CI runs in UTC, where every local day is exactly 24 hours long and local
 * midnight is the same instant as UTC midnight — so a DST bug and a
 * UTC-vs-local bug are both invisible there unless the zone is pinned.
 */
const inTimeZone = <T>(timeZone: string, run: () => T): T => {
  const original = process.env.TZ;
  process.env.TZ = timeZone;

  try {
    return run();
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
};

const template = (
  overrides: Partial<RecurringTransaction> & { name: string },
): RecurringTransaction => ({
  id: `id-${overrides.name}`,
  description: "",
  amount: 100,
  categoryId: "category-id",
  categoryName: "Rent",
  categoryType: CategoryType.Expense,
  frequencyId: "frequency-id",
  frequencyName: "Monthly",
  frequencyType: FrequencyType.Monthly,
  startDate: at(2026, 1, 1),
  endDate: null,
  nextOccurrenceDate: at(2026, 9, 1),
  status: "Active" as RecurringStatus,
  createdAt: at(2026, 1, 1),
  createdBy: "person@example.com",
  ...overrides,
});

describe("daysUntil", () => {
  it("counts whole calendar days, ignoring the time of day", () => {
    expect(daysUntil(at(2026, 8, 29, 1), at(2026, 8, 26, 23))).toBe(3);
    expect(daysUntil(at(2026, 8, 26, 23), at(2026, 8, 26, 1))).toBe(0);
  });

  it("goes negative for a date that has already passed", () => {
    expect(daysUntil(at(2026, 8, 24), at(2026, 8, 26))).toBe(-2);
  });

  it("survives a daylight-saving shift", () => {
    inTimeZone("America/New_York", () => {
      // A 23-hour spring-forward day truncates to 0 under plain division,
      // turning "tomorrow" into "today" once a year; a 25-hour day in autumn
      // would read as 1.04.
      expect(daysUntil(at(2026, 3, 9), at(2026, 3, 8))).toBe(1);
      expect(daysUntil(at(2026, 11, 2), at(2026, 11, 1))).toBe(1);
    });
  });
});

describe("nextOccurrenceLabel", () => {
  const now = at(2026, 8, 26);

  it("says when an active template is next due", () => {
    expect(nextOccurrenceLabel("Active", at(2026, 8, 26), now)).toBe(
      "Due today",
    );
    expect(nextOccurrenceLabel("Active", at(2026, 8, 27), now)).toBe(
      "Due tomorrow",
    );
    expect(nextOccurrenceLabel("Active", at(2026, 8, 31), now)).toBe(
      "Due in 5 days",
    );
  });

  it("reports an overdue template, singular and plural", () => {
    expect(nextOccurrenceLabel("Active", at(2026, 8, 25), now)).toBe(
      "Overdue by 1 day",
    );
    expect(nextOccurrenceLabel("Active", at(2026, 8, 23), now)).toBe(
      "Overdue by 3 days",
    );
  });

  it("shows no date for a paused or cancelled template", () => {
    // Pausing leaves `nextOccurrenceDate` where it is and resuming is what
    // fast-forwards it, so the stored date is stale by design — printing it
    // would promise a date the template will not use.
    expect(nextOccurrenceLabel("Paused", at(2026, 1, 1), now)).toBe(
      "Paused — nothing will be generated",
    );
    expect(nextOccurrenceLabel("Cancelled", at(2026, 1, 1), now)).toBe(
      "No further occurrences",
    );
  });
});

describe("isDue", () => {
  const now = at(2026, 8, 26);

  it("is true only for an active template due today or earlier", () => {
    expect(isDue("Active", at(2026, 8, 26), now)).toBe(true);
    expect(isDue("Active", at(2026, 8, 20), now)).toBe(true);
    expect(isDue("Active", at(2026, 8, 27), now)).toBe(false);
    expect(isDue("Paused", at(2026, 8, 20), now)).toBe(false);
    expect(isDue("Cancelled", at(2026, 8, 20), now)).toBe(false);
  });
});

describe("toDateInputValue", () => {
  it("formats local calendar parts, not a UTC instant", () => {
    // `toISOString().slice(0, 10)` shifts the date by a day either side of UTC
    // near midnight, which would silently move a start date the user picked.
    inTimeZone("America/New_York", () => {
      expect(toDateInputValue(at(2026, 1, 5, 23))).toBe("2026-01-05");
    });

    inTimeZone("Asia/Tokyo", () => {
      expect(toDateInputValue(at(2026, 12, 31, 0))).toBe("2026-12-31");
    });
  });
});

describe("frequency options", () => {
  const option = (overrides: Partial<FrequencyOption>): FrequencyOption => ({
    id: "frequency-id",
    name: "Monthly",
    type: FrequencyType.Monthly,
    intervalDays: null,
    description: "Once a month",
    isActive: true,
    ...overrides,
  });

  it("drops frequencies the API would refuse to save", () => {
    // `GET /recurring-options` returns every row, but create and update reject
    // an inactive frequency and a custom one with no positive interval.
    expect(isSelectableFrequency(option({}))).toBe(true);
    expect(isSelectableFrequency(option({ isActive: false }))).toBe(false);
    expect(
      isSelectableFrequency(
        option({ type: FrequencyType.Custom, intervalDays: null }),
      ),
    ).toBe(false);
    expect(
      isSelectableFrequency(
        option({ type: FrequencyType.Custom, intervalDays: 0 }),
      ),
    ).toBe(false);
    expect(
      isSelectableFrequency(
        option({ type: FrequencyType.Custom, intervalDays: 10 }),
      ),
    ).toBe(true);
  });

  it("keeps the usable options in order", () => {
    const options = [
      option({ id: "a" }),
      option({ id: "b", isActive: false }),
      option({ id: "c" }),
    ];

    expect(selectableFrequencies(options).map((f) => f.id)).toEqual(["a", "c"]);
  });

  it("spells out a custom interval, since its name never does", () => {
    expect(
      describeFrequency(
        option({ type: FrequencyType.Custom, intervalDays: 10 }),
      ),
    ).toBe("Every 10 days");
    expect(
      describeFrequency(
        option({ type: FrequencyType.Custom, intervalDays: 1 }),
      ),
    ).toBe("Every day");
    expect(describeFrequency(option({ description: null }))).toBe("");
  });
});

describe("byNextOccurrence", () => {
  it("puts the soonest active template first", () => {
    const soon = template({ name: "Soon", nextOccurrenceDate: at(2026, 9, 1) });
    const later = template({
      name: "Later",
      nextOccurrenceDate: at(2026, 10, 1),
    });

    expect([later, soon].sort(byNextOccurrence).map((t) => t.name)).toEqual([
      "Soon",
      "Later",
    ]);
  });

  it("sorts paused and cancelled templates after every active one", () => {
    // Their next-occurrence date is not a date they will use, so ordering the
    // whole list by it would push meaningless rows to the top.
    const paused = template({
      name: "Paused",
      status: "Paused",
      nextOccurrenceDate: at(2026, 1, 1),
    });
    const active = template({
      name: "Active",
      nextOccurrenceDate: at(2026, 12, 1),
    });

    expect([paused, active].sort(byNextOccurrence).map((t) => t.name)).toEqual([
      "Active",
      "Paused",
    ]);
  });

  it("falls back to name so the order is stable", () => {
    const b = template({ name: "B", nextOccurrenceDate: at(2026, 9, 1) });
    const a = template({ name: "A", nextOccurrenceDate: at(2026, 9, 1) });

    expect([b, a].sort(byNextOccurrence).map((t) => t.name)).toEqual([
      "A",
      "B",
    ]);
  });
});

describe("buildRecurringSummary", () => {
  const now = at(2026, 8, 26);

  it("counts each status and names what happens next", () => {
    const summary = buildRecurringSummary(
      [
        template({ name: "Rent", nextOccurrenceDate: at(2026, 9, 1) }),
        template({ name: "Gym", nextOccurrenceDate: at(2026, 8, 28) }),
        template({ name: "Old", status: "Paused" }),
        template({ name: "Gone", status: "Cancelled" }),
      ],
      now,
    );

    expect(summary).toEqual([
      { label: "Active", value: "2" },
      { label: "Paused", value: "1" },
      { label: "Next up", value: "Gym" },
      { label: "When", value: "Due in 2 days" },
    ]);
  });

  it("ignores paused and cancelled templates when picking what is next", () => {
    const soonButPaused = template({
      name: "Paused",
      status: "Paused",
      nextOccurrenceDate: at(2026, 8, 27),
    });
    const active = template({
      name: "Active",
      nextOccurrenceDate: at(2026, 9, 30),
    });

    expect(nextDueTemplate([soonButPaused, active])?.name).toBe("Active");
  });

  it("says so when nothing is scheduled", () => {
    const summary = buildRecurringSummary(
      [template({ name: "Gone", status: "Cancelled" })],
      now,
    );

    expect(summary).toEqual([
      { label: "Active", value: "0" },
      { label: "Paused", value: "0" },
      { label: "Next up", value: "Nothing scheduled" },
      { label: "When", value: "—" },
    ]);
  });
});
