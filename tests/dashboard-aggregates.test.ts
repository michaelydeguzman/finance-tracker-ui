import { describe, expect, it } from "vitest";
import {
  barChartDataFromTotals,
  filterTransactionsByRange,
  monthlyAverages,
  pieByCategory,
  summarizeTotals,
} from "@/components/dashboard/aggregates";
import {
  inclusiveMonthSpan,
  isTransactionInRange,
  resolvePeriodRange,
} from "@/components/dashboard/date-range";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";

const tx = (
  overrides: Partial<Transaction> & { amount: number; date: string },
): Transaction => ({
  id: overrides.id ?? crypto.randomUUID(),
  name: overrides.name ?? "Item",
  categoryId: overrides.categoryId ?? "cat",
  categoryName: overrides.categoryName ?? "General",
  categoryType: overrides.categoryType ?? CategoryType.Expense,
  description: overrides.description ?? "",
  amount: overrides.amount,
  transactionDate: new Date(overrides.date),
  createdAt: new Date(overrides.date),
  createdBy: "test",
});

describe("summarizeTotals", () => {
  it("splits income from expenses and derives savings", () => {
    const result = summarizeTotals([
      tx({
        amount: 1000,
        date: "2026-01-05",
        categoryType: CategoryType.Income,
      }),
      tx({ amount: 250, date: "2026-01-06" }),
      tx({ amount: 150, date: "2026-01-07" }),
    ]);

    expect(result).toEqual({
      totalIncome: 1000,
      totalExpenses: 400,
      savings: 600,
    });
  });

  it("reports negative savings when spending exceeds income", () => {
    const result = summarizeTotals([
      tx({
        amount: 100,
        date: "2026-01-05",
        categoryType: CategoryType.Income,
      }),
      tx({ amount: 400, date: "2026-01-06" }),
    ]);

    expect(result.savings).toBe(-300);
  });

  it("returns zeroes for an empty list", () => {
    expect(summarizeTotals([])).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      savings: 0,
    });
  });
});

describe("barChartDataFromTotals", () => {
  it("emits income, expenses, and savings rounded to cents", () => {
    const rows = barChartDataFromTotals([
      tx({
        amount: 10.005,
        date: "2026-01-05",
        categoryType: CategoryType.Income,
      }),
      tx({ amount: 3.334, date: "2026-01-06" }),
    ]);

    expect(rows.map((row) => row.label)).toEqual([
      "Income",
      "Expenses",
      "Savings",
    ]);
    expect(rows[1]!.value).toBe(3.33);
  });
});

describe("pieByCategory", () => {
  it("groups by category name, filters by type, and sorts descending", () => {
    const slices = pieByCategory(
      [
        tx({ amount: 30, date: "2026-01-05", categoryName: "Food" }),
        tx({ amount: 60, date: "2026-01-06", categoryName: "Rent" }),
        tx({ amount: 20, date: "2026-01-07", categoryName: "Food" }),
        tx({
          amount: 900,
          date: "2026-01-08",
          categoryName: "Salary",
          categoryType: CategoryType.Income,
        }),
      ],
      CategoryType.Expense,
    );

    expect(slices.map((slice) => [slice.categoryName, slice.value])).toEqual([
      ["Rent", 60],
      ["Food", 50],
    ]);
    expect(slices.every((slice) => slice.fill.length > 0)).toBe(true);
  });
});

describe("date ranges", () => {
  const now = new Date(2026, 5, 15); // 15 June 2026

  it("resolves 'all' to no range", () => {
    expect(resolvePeriodRange("all", now, null, null)).toBeNull();
  });

  it("resolves last_3_months to a 3-month inclusive window", () => {
    const range = resolvePeriodRange("last_3_months", now, null, null)!;
    expect(range.start.getMonth()).toBe(3); // April
    expect(inclusiveMonthSpan(range.start, range.end)).toBe(3);
  });

  it("swaps a custom range given backwards", () => {
    const range = resolvePeriodRange(
      "custom",
      now,
      new Date(2026, 5, 20),
      new Date(2026, 5, 10),
    )!;

    expect(range.start.getTime()).toBeLessThan(range.end.getTime());
    expect(range.start.getDate()).toBe(10);
    expect(range.end.getDate()).toBe(20);
  });

  it("treats range bounds as inclusive", () => {
    const range = resolvePeriodRange(
      "custom",
      now,
      new Date(2026, 5, 1),
      new Date(2026, 5, 30),
    )!;

    expect(isTransactionInRange(new Date(2026, 5, 1, 0, 0, 0), range)).toBe(
      true,
    );
    expect(isTransactionInRange(new Date(2026, 5, 30, 23, 59), range)).toBe(
      true,
    );
    expect(isTransactionInRange(new Date(2026, 6, 1), range)).toBe(false);
  });

  it("keeps everything when the range is null", () => {
    const rows = [tx({ amount: 1, date: "1999-01-01" })];
    expect(filterTransactionsByRange(rows, null)).toHaveLength(1);
  });
});

describe("monthlyAverages", () => {
  it("divides by the inclusive month span of the range", () => {
    const range = resolvePeriodRange(
      "custom",
      new Date(2026, 5, 15),
      new Date(2026, 3, 1),
      new Date(2026, 5, 30),
    );

    const { months, avgExpenses } = monthlyAverages(
      [
        tx({ amount: 300, date: "2026-04-10" }),
        tx({ amount: 300, date: "2026-06-10" }),
      ],
      range,
    );

    expect(months).toBe(3);
    expect(avgExpenses).toBe(200);
  });

  it("never divides by zero", () => {
    const { months } = monthlyAverages([], null);
    expect(months).toBeGreaterThanOrEqual(1);
  });
});
