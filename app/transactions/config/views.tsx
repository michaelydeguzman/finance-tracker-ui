import { ReceiptTextIcon, WalletIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CategoryType } from "@/types/shared/enums";

/**
 * Everything that differs between the Income and Expenses pages.
 *
 * The two pages were near-identical copies; the only real differences were
 * copy, icon, and accent colour, so they live here instead of in two parallel
 * component trees.
 */
export type TransactionView = {
  title: string;
  addLabel: string;
  addDescription: string;
  exportDescription: string;
  loadingText: string;
  emptyText: string;
  icon: ReactNode;
  iconClassName: string;
  /**
   * Sign shown before the amount. Income and expenses render in the same
   * colour, so this is what distinguishes them.
   */
  amountPrefix?: string;
  showDividers: boolean;
  showTrends: boolean;
};

export const TRANSACTION_VIEWS: Record<
  CategoryType.Income | CategoryType.Expense,
  TransactionView
> = {
  [CategoryType.Income]: {
    title: "Income",
    addLabel: "Add Income",
    addDescription: "Record a new income entry",
    exportDescription: "Download the current income dataset",
    loadingText: "Loading income transactions...",
    emptyText: "No income records yet. Start by logging your first entry.",
    icon: <WalletIcon className="size-5" />,
    iconClassName: "bg-emerald-500/10 text-emerald-600",
    showDividers: true,
    showTrends: false,
  },
  [CategoryType.Expense]: {
    title: "Expenses",
    addLabel: "Add Expense",
    addDescription: "Record a new expense entry",
    exportDescription: "Download the current expense dataset",
    loadingText: "Loading expense transactions...",
    emptyText: "No expenses yet. Add your first expense to start tracking.",
    icon: <ReceiptTextIcon className="size-5" />,
    iconClassName: "bg-destructive/10 text-destructive",
    amountPrefix: "− ",
    showDividers: false,
    showTrends: true,
  },
};
