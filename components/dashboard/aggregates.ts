import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";
import {
  type ResolvedDateRange,
  inclusiveMonthSpan,
  isTransactionInRange,
} from "@/components/dashboard/date-range";

export type CategorySlice = {
  categoryName: string;
  value: number;
  fill: string;
};

export type BarTotalsRow = {
  label: string;
  value: number;
};

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function chartColorAt(i: number): string {
  return PIE_COLORS[i % PIE_COLORS.length] ?? "hsl(var(--muted))";
}

export function filterTransactionsByRange(
  transactions: Transaction[],
  range: ResolvedDateRange,
): Transaction[] {
  return transactions.filter((t) =>
    isTransactionInRange(t.transactionDate, range),
  );
}

export function summarizeTotals(transactions: Transaction[]): {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
} {
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const t of transactions) {
    if (t.categoryType === CategoryType.Income) {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  }
  return {
    totalIncome,
    totalExpenses,
    savings: totalIncome - totalExpenses,
  };
}

export function barChartDataFromTotals(transactions: Transaction[]): BarTotalsRow[] {
  const { totalIncome, totalExpenses, savings } = summarizeTotals(transactions);
  return [
    { label: "Income", value: Math.round(totalIncome * 100) / 100 },
    { label: "Expenses", value: Math.round(totalExpenses * 100) / 100 },
    { label: "Savings", value: Math.round(savings * 100) / 100 },
  ];
}

export function pieByCategory(
  transactions: Transaction[],
  type: CategoryType,
): CategorySlice[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.categoryType !== type) {
      continue;
    }
    map.set(t.categoryName, (map.get(t.categoryName) ?? 0) + t.amount);
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return entries.map(([categoryName, value], i) => ({
    categoryName,
    value: Math.round(value * 100) / 100,
    fill: chartColorAt(i),
  }));
}

export function monthlyAverages(
  transactions: Transaction[],
  range: ResolvedDateRange,
): { avgIncome: number; avgExpenses: number; months: number } {
  const { totalIncome, totalExpenses } = summarizeTotals(transactions);
  if (!range) {
    const months = Math.max(
      1,
      distinctMonthCount(transactions.map((t) => t.transactionDate)),
    );
    return {
      months,
      avgIncome: totalIncome / months,
      avgExpenses: totalExpenses / months,
    };
  }
  const months = Math.max(1, inclusiveMonthSpan(range.start, range.end));
  return {
    months,
    avgIncome: totalIncome / months,
    avgExpenses: totalExpenses / months,
  };
}

function distinctMonthCount(dates: Date[]): number {
  const keys = new Set<string>();
  for (const d of dates) {
    keys.add(`${d.getFullYear()}-${d.getMonth()}`);
  }
  return Math.max(1, keys.size);
}
