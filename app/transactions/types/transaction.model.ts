import type { CategoryType } from "@/types/shared/enums";

export interface Transaction {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  description: string;
  amount: number;
  transactionDate: Date;
  frequencyId?: string | null;
  frequencyName?: string | null;
  createdAt: Date;
  createdBy: string;
}

export interface TransactionEntry {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  /** ISO string — the row formats it for display. */
  date: string;
  /** Absent when the transaction carries no meaningful author. */
  createdBy?: string;
  /** Absent for one-off transactions. */
  frequencyName?: string;
}

export interface TransactionSummaryItem {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
}

/** Keys the sidebar maps to a concrete icon — a union so a typo fails to compile. */
export type QuickActionIcon = "add" | "export";

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon: QuickActionIcon;
  callback: () => void;
}
