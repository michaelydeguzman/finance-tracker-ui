export type DashboardPeriodPreset =
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "last_12_months"
  | "ytd"
  | "all"
  | "custom";

export type ResolvedDateRange = {
  start: Date;
  end: Date;
} | null;

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** Inclusive count of calendar months touched by [start, end]. */
export function inclusiveMonthSpan(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1
  );
}

function lastNMonthWindow(now: Date, n: number): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
  return { start, end: endOfDay(now) };
}

/**
 * Resolves a preset to [start, end] in local time. `all` → null (no filter).
 * For `custom`, pass sorted dates (callers should normalize start ≤ end).
 */
export function resolvePeriodRange(
  preset: DashboardPeriodPreset,
  now: Date,
  customStart: Date | null,
  customEnd: Date | null,
): ResolvedDateRange {
  if (preset === "all") {
    return null;
  }

  if (preset === "custom") {
    if (!customStart || !customEnd) {
      return { start: startOfMonth(now), end: endOfDay(now) };
    }
    const a = startOfDay(customStart);
    const b = endOfDay(customEnd);
    if (a > b) {
      return { start: startOfDay(customEnd), end: endOfDay(customStart) };
    }
    return { start: a, end: b };
  }

  if (preset === "last_month") {
    const y = now.getFullYear();
    const m = now.getMonth();
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === "last_3_months") {
    return lastNMonthWindow(now, 3);
  }
  if (preset === "last_6_months") {
    return lastNMonthWindow(now, 6);
  }
  if (preset === "last_12_months") {
    return lastNMonthWindow(now, 12);
  }

  if (preset === "ytd") {
    return {
      start: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
      end: endOfDay(now),
    };
  }

  return lastNMonthWindow(now, 3);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function isTransactionInRange(
  transactionDate: Date,
  range: ResolvedDateRange,
): boolean {
  if (!range) {
    return true;
  }
  const t = transactionDate.getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}
