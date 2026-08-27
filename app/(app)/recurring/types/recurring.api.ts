import type { FrequencyType } from "@/types/shared/enums";
import type { RecurringStatus } from "@/lib/recurring-status";

/**
 * `GET /api/v1/recurring-transactions` — the wire shape, before mapping.
 *
 * The enum formats are deliberately asymmetric and are left exactly as the API
 * sends them: `categoryType` and `status` are strings, `frequencyType` is a
 * number. Each matches the format this app already receives for that concept
 * elsewhere, so nothing here needs a new parsing rule.
 */
export interface RecurringTransactionResponse {
  id: string;
  name: string;
  description?: string | null;
  /** The template's default amount — what each generated transaction is worth. */
  amount: number;
  categoryId: string;
  categoryName: string;
  /** A name, e.g. `"Expense"` — the same format `TransactionResponse` uses. */
  categoryType: string;
  frequencyId: string;
  frequencyName: string;
  /** Numeric, matching `FrequencyResponse` and `types/shared/enums.ts`. */
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string | null;
  nextOccurrenceDate: string;
  status: RecurringStatus;
  createdAt: string;
  createdBy: string;
}

/**
 * Body for both create and update. Neither carries an id, a status or a
 * `createdBy`: ownership comes from the bearer token, and status only changes
 * through the pause / resume / cancel endpoints.
 */
export interface UpsertRecurringTransactionRequest {
  name: string;
  description?: string | null;
  amount: number;
  categoryId: string;
  frequencyId: string;
  /** A `Date` on the client; an ISO string once it has been through JSON. */
  startDate: Date | string;
  endDate?: Date | string | null;
}
