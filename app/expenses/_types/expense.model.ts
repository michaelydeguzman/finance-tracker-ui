export type ExpenseStatus = "posted" | "pending" | "upcoming";

export interface ExpenseEntry {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paymentMethod: string;
  status: ExpenseStatus;
}

export interface ExpenseSummaryItem {
  label: string;
  value: string;
  variance?: string;
  trend?: "up" | "down" | "flat";
}

export interface ExpenseQuickAction {
  id: string;
  label: string;
  description?: string;
}

export interface UpcomingBill {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  status?: "due" | "scheduled" | "paid";
  autoPay?: boolean;
}
