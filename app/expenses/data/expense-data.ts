import { CategoryType } from "@/types/shared/enums";
import type {
  Transaction,
  TransactionSummaryItem,
  QuickActionItem,
  TransactionEntry,
} from "../../transactions/types/transaction.model";

const DISPLAY_CURRENCY = "CAD";

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    maximumFractionDigits: 0,
  });

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const buildExpenseEntries = (
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

export const buildExpenseSummary = (
  transactions: Transaction[],
): TransactionSummaryItem[] => {
  const monthlyTotals = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      const key = getMonthKey(transaction.transactionDate);
      acc[key] = (acc[key] ?? 0) + transaction.amount;
      return acc;
    },
    {},
  );

  const now = new Date();
  const currentMonthKey = getMonthKey(now);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = getMonthKey(previousMonthDate);

  const totals = Object.values(monthlyTotals);
  const average =
    totals.length > 0
      ? totals.reduce((sum, total) => sum + total, 0) / totals.length
      : 0;

  const currentMonthTotal = monthlyTotals[currentMonthKey] ?? 0;
  const previousMonthTotal = monthlyTotals[previousMonthKey] ?? 0;

  return [
    {
      label: "This Month",
      value: formatCurrency(currentMonthTotal),
      ...(currentMonthTotal > previousMonthTotal
        ? { trend: "up" as const }
        : currentMonthTotal < previousMonthTotal
          ? { trend: "down" as const }
          : { trend: "flat" as const }),
    },
    {
      label: "Last Month",
      value: formatCurrency(previousMonthTotal),
      ...(previousMonthTotal > 0 ? { trend: "flat" as const } : {}),
    },
    {
      label: "Average",
      value: formatCurrency(average),
      ...(average > 0 ? { trend: "up" as const } : {}),
    },
  ];
};

export const buildExpenseQuickActions = (
  callbacks?: Partial<Record<"add-expense" | "export", () => void>>,
): QuickActionItem[] => [
  {
    id: "add-expense",
    label: "Add Expense",
    description: "Wire this to your income form",
    icon: "add",
    callback: callbacks?.["add-expense"] ?? (() => undefined),
  },
  {
    id: "export",
    label: "Export Data",
    description: "Download the current expense dataset",
    icon: "export",
    callback: callbacks?.export ?? (() => undefined),
  },
];
