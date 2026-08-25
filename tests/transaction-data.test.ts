import { describe, expect, it } from "vitest";
import { buildTransactionSummary } from "@/app/transactions/data/transaction-data";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";

const tx = (amount: number, date: Date): Transaction => ({
  id: crypto.randomUUID(),
  name: "Item",
  categoryId: "cat",
  categoryName: "General",
  categoryType: CategoryType.Expense,
  description: "",
  amount,
  transactionDate: date,
  createdAt: date,
  createdBy: "test",
});

const NOW = new Date(2026, 5, 15); // 15 June 2026
const thisMonth = new Date(2026, 5, 3);
const lastMonth = new Date(2026, 4, 3);
const twoMonthsAgo = new Date(2026, 3, 3);

describe("buildTransactionSummary", () => {
  it("reports this month, last month, and the monthly average", () => {
    const summary = buildTransactionSummary(
      [tx(100, thisMonth), tx(50, lastMonth), tx(30, twoMonthsAgo)],
      NOW,
    );

    expect(summary.map((item) => item.label)).toEqual([
      "This Month",
      "Last Month",
      "Average",
    ]);
    expect(summary[0]!.value).toContain("100");
    expect(summary[1]!.value).toContain("50");
    // (100 + 50 + 30) / 3 months that actually have transactions.
    expect(summary[2]!.value).toContain("60");
  });

  it("marks a rise and a fall month over month", () => {
    const rising = buildTransactionSummary(
      [tx(100, thisMonth), tx(50, lastMonth)],
      NOW,
    );
    expect(rising[0]!.trend).toBe("up");

    const falling = buildTransactionSummary(
      [tx(10, thisMonth), tx(50, lastMonth)],
      NOW,
    );
    expect(falling[0]!.trend).toBe("down");
  });

  it("marks equal months as flat and leaves the average untrended", () => {
    const summary = buildTransactionSummary(
      [tx(50, thisMonth), tx(50, lastMonth)],
      NOW,
    );

    expect(summary[0]!.trend).toBe("flat");
    expect(summary[2]!.trend).toBeUndefined();
  });

  it("handles an empty list without dividing by zero", () => {
    const summary = buildTransactionSummary([], NOW);
    expect(summary).toHaveLength(3);
    expect(summary[2]!.value).toContain("0");
  });
});
