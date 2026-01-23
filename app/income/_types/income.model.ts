export interface IncomeEntry {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
}

export interface IncomeSummaryItem {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
}

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
}
