export interface Category {
  id: string;
  name: string;
  categoryType: CategoryTypes;
  createdAt: Date;
  isActive: boolean;
  recurringProperties?: RecurringProperties;
}

export enum CategoryTypes {
  INCOME = "income",
  EXPENSE = "expense",
}

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export interface RecurringProperties {
  frequency: Frequency;
  startDate: Date;
  endDate: Date | null;
}
