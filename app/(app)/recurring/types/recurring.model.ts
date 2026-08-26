import type { CategoryType, FrequencyType } from "@/types/shared/enums";
import type { RecurringStatus } from "@/lib/recurring-status";

/** A recurring template as the UI holds it: dates parsed, category type numeric. */
export interface RecurringTransaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  frequencyId: string;
  frequencyName: string;
  frequencyType: FrequencyType;
  startDate: Date;
  /** Null when the template runs indefinitely. */
  endDate: Date | null;
  /** When the worker will next materialize a transaction from this template. */
  nextOccurrenceDate: Date;
  status: RecurringStatus;
  createdAt: Date;
  createdBy: string;
}

/** What the create / edit dialog hands back, before it becomes a request body. */
export interface RecurringTransactionInput {
  name: string;
  description?: string;
  amount: number;
  categoryId: string;
  frequencyId: string;
  startDate: string;
  endDate?: string;
}
