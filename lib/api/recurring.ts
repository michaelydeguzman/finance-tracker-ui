/**
 * Recurring-template API — client calls go to the Next.js
 * `/api/recurring-transactions/*` routes (same pattern as `lib/api/transactions.ts`).
 */
import { apiFetch } from "@/lib/api/config";
import { coerceCategoryType } from "@/lib/category-type";
import {
  RECURRING_ENDPOINTS,
  recurringListUrl,
} from "@/lib/api/endpoints/recurring";
import type {
  RecurringStatus,
  RecurringTransition,
} from "@/lib/recurring-status";
import type { FrequencyResponse } from "@/types/shared/frequency.api";
import type { FrequencyOption } from "@/app/(app)/recurring/types/frequency.model";
import type {
  RecurringTransactionResponse,
  UpsertRecurringTransactionRequest,
} from "@/app/(app)/recurring/types/recurring.api";
import type { RecurringTransaction } from "@/app/(app)/recurring/types/recurring.model";

/**
 * Wire shape to UI model. Only the dates and the category type are converted:
 * `status` and `frequencyType` already arrive in the format the app uses.
 */
const mapRecurringTransaction = (
  template: RecurringTransactionResponse,
): RecurringTransaction => ({
  id: template.id,
  name: template.name,
  description: template.description ?? "",
  amount: Number(template.amount),
  categoryId: template.categoryId,
  categoryName: template.categoryName,
  categoryType: coerceCategoryType(template.categoryType),
  frequencyId: template.frequencyId,
  frequencyName: template.frequencyName,
  frequencyType: template.frequencyType,
  startDate: new Date(template.startDate),
  endDate: template.endDate ? new Date(template.endDate) : null,
  nextOccurrenceDate: new Date(template.nextOccurrenceDate),
  status: template.status,
  createdAt: new Date(template.createdAt),
  createdBy: template.createdBy,
});

export const getRecurringTransactions = async (
  status?: RecurringStatus,
  init?: RequestInit,
): Promise<RecurringTransaction[]> =>
  (
    await apiFetch<RecurringTransactionResponse[]>(
      recurringListUrl(status),
      init,
    )
  ).map(mapRecurringTransaction);

export const createRecurringTransaction = async (
  payload: UpsertRecurringTransactionRequest,
): Promise<RecurringTransaction> =>
  mapRecurringTransaction(
    await apiFetch<RecurringTransactionResponse>(RECURRING_ENDPOINTS.list, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const updateRecurringTransaction = async (
  id: string,
  payload: UpsertRecurringTransactionRequest,
): Promise<RecurringTransaction> =>
  mapRecurringTransaction(
    await apiFetch<RecurringTransactionResponse>(RECURRING_ENDPOINTS.byId(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

/**
 * Runs a state transition and returns the template as the API now sees it.
 *
 * The response is the source of truth rather than a locally-guessed status:
 * resuming also fast-forwards `nextOccurrenceDate`, which the client has no way
 * to compute.
 */
export const transitionRecurringTransaction = async (
  id: string,
  transition: RecurringTransition,
): Promise<RecurringTransaction> =>
  mapRecurringTransaction(
    await apiFetch<RecurringTransactionResponse>(
      RECURRING_ENDPOINTS.transition(id, transition),
      { method: "POST" },
    ),
  );

export const deleteRecurringTransaction = async (id: string): Promise<void> =>
  apiFetch<void>(RECURRING_ENDPOINTS.byId(id), { method: "DELETE" });

/**
 * The frequencies a template can be scheduled on, for the dialog's picker.
 *
 * Returned as sent, including inactive rows — narrowing to the ones a template
 * can actually use is `isSelectableFrequency`'s job, and it is pure so it can be
 * tested.
 */
export const getRecurringOptions = async (
  init?: RequestInit,
): Promise<FrequencyOption[]> =>
  (await apiFetch<FrequencyResponse[]>(RECURRING_ENDPOINTS.options, init)).map(
    (frequency) => ({
      id: frequency.id,
      name: frequency.name,
      type: frequency.type,
      intervalDays: frequency.intervalDays,
      description: frequency.description,
      isActive: frequency.isActive,
    }),
  );
