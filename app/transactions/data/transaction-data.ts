import { DISPLAY_CURRENCY, formatCurrency } from "@/lib/currency";
import type {
  QuickActionItem,
  Transaction,
  TransactionEntry,
  TransactionSummaryItem,
} from "../types/transaction.model";

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const buildTransactionEntries = (
  transactions: Transaction[],
): TransactionEntry[] =>
  transactions.map((transaction) => ({
    id: transaction.id,
    title: transaction.name,
    description: transaction.description,
    amount: transaction.amount,
    currency: DISPLAY_CURRENCY,
    category: transaction.categoryName,
    date: transaction.transactionDate.toISOString(),
  }));

/**
 * Narrows transactions to the selected categories.
 *
 * An empty selection means "no filter applied", not "match nothing" — every
 * chip being off is the page's default state, and it shows everything.
 */
export const filterTransactionsByCategories = (
  transactions: Transaction[],
  selectedCategoryIds: string[],
): Transaction[] => {
  if (selectedCategoryIds.length === 0) {
    return transactions;
  }

  const selected = new Set(selectedCategoryIds);
  return transactions.filter((transaction) =>
    selected.has(transaction.categoryId),
  );
};

type Trend = NonNullable<TransactionSummaryItem["trend"]>;

/** Month-over-month direction, or `flat` when equal / nothing to compare. */
const trendBetween = (current: number, previous: number): Trend => {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
};

/**
 * "This month", "Last month", and a monthly average.
 *
 * The average divides by the number of months that actually contain
 * transactions, not by the calendar span — an empty month would otherwise drag
 * the figure down without the user having recorded anything.
 */
export const buildTransactionSummary = (
  transactions: Transaction[],
  now: Date = new Date(),
): TransactionSummaryItem[] => {
  const monthlyTotals = transactions.reduce<Record<string, number>>(
    (totals, transaction) => {
      const key = monthKey(transaction.transactionDate);
      totals[key] = (totals[key] ?? 0) + transaction.amount;
      return totals;
    },
    {},
  );

  const currentKey = monthKey(now);
  const previousKey = monthKey(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const twoMonthsAgoKey = monthKey(
    new Date(now.getFullYear(), now.getMonth() - 2, 1),
  );

  const currentTotal = monthlyTotals[currentKey] ?? 0;
  const previousTotal = monthlyTotals[previousKey] ?? 0;
  const twoMonthsAgoTotal = monthlyTotals[twoMonthsAgoKey] ?? 0;

  const totals = Object.values(monthlyTotals);
  const average =
    totals.length > 0
      ? totals.reduce((sum, total) => sum + total, 0) / totals.length
      : 0;

  return [
    {
      label: "This Month",
      value: formatCurrency(currentTotal),
      trend: trendBetween(currentTotal, previousTotal),
    },
    {
      label: "Last Month",
      value: formatCurrency(previousTotal),
      trend: trendBetween(previousTotal, twoMonthsAgoTotal),
    },
    {
      label: "Average",
      value: formatCurrency(average),
    },
  ];
};

export type QuickActionCallbacks = {
  onAdd: () => void;
  onExport: () => void;
};

export const buildQuickActions = (
  addLabel: string,
  addDescription: string,
  exportDescription: string,
  callbacks: QuickActionCallbacks,
): QuickActionItem[] => [
  {
    id: "add",
    label: addLabel,
    description: addDescription,
    icon: "add",
    callback: callbacks.onAdd,
  },
  {
    id: "export",
    label: "Export Data",
    description: exportDescription,
    icon: "export",
    callback: callbacks.onExport,
  },
];
