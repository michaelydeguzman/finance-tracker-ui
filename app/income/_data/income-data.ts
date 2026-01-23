import type {
  IncomeEntry,
  IncomeSummaryItem,
  QuickActionItem,
} from "../_types/income.model";

export const incomeEntries: IncomeEntry[] = Array.from({ length: 12 }).map(
  (_, index) => ({
    id: `income-${index + 1}`,
    title: `Income Entry #${index + 1}`,
    description:
      "Sample income entry to validate layout, scrolling behavior, and responsive design for the income page.",
    amount: 1200 + index * 50,
    currency: "CAD",
    category: index % 2 === 0 ? "Salary" : "Freelance",
    date: new Date(2026, 0, index + 1).toISOString(),
  }),
);

export const incomeSummary: IncomeSummaryItem[] = [
  { label: "This Month", value: "$5,240", trend: "up" },
  { label: "Last Month", value: "$4,980", trend: "flat" },
  { label: "Average", value: "$5,110", trend: "up" },
];

export const quickActions: QuickActionItem[] = [
  { id: "add-income", label: "Add Income", description: "Log new earnings" },
  { id: "export", label: "Export Data", description: "Download CSV" },
];
