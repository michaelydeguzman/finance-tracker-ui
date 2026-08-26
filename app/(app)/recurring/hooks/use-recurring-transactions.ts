"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
  transitionRecurringTransaction,
  updateRecurringTransaction,
} from "@/lib/api/recurring";
import type { RecurringTransition } from "@/lib/recurring-status";
import { byNextOccurrence } from "../data/recurring-data";
import type {
  RecurringTransaction,
  RecurringTransactionInput,
} from "../types/recurring.model";
import type { UpsertRecurringTransactionRequest } from "../types/recurring.api";

interface UseRecurringTransactionsResult {
  templates: RecurringTransaction[];
  /** The initial load. Rows are never rendered as "none yet" while this is true. */
  pending: boolean;
  /** Ids with an action in flight, so a row can disable its own menu. */
  busyIds: ReadonlySet<string>;
  addTemplate: (input: RecurringTransactionInput) => Promise<boolean>;
  editTemplate: (
    id: string,
    input: RecurringTransactionInput,
  ) => Promise<boolean>;
  runTransition: (id: string, transition: RecurringTransition) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
}

const toUpsertPayload = (
  input: RecurringTransactionInput,
): UpsertRecurringTransactionRequest => ({
  name: input.name.trim(),
  description: input.description?.trim() ? input.description.trim() : null,
  amount: input.amount,
  categoryId: input.categoryId,
  frequencyId: input.frequencyId,
  startDate: input.startDate,
  endDate: input.endDate?.trim() ? input.endDate : null,
});

const errorMessage = (reason: unknown, fallback: string): string =>
  reason instanceof Error && reason.message ? reason.message : fallback;

const PAST_TENSE: Record<RecurringTransition, string> = {
  pause: "paused",
  resume: "resumed",
  cancel: "cancelled",
};

/**
 * Recurring templates, deliberately without the optimistic-list treatment the
 * transaction and category screens use.
 *
 * Two things make a guessed local result the wrong answer here. The server owns
 * fields the client cannot compute — resuming fast-forwards
 * `nextOccurrenceDate` past everything that elapsed while paused — and several
 * actions can legitimately be refused with a 409. Showing the change and then
 * taking it back would be worse than a moment's spinner, so every mutation
 * waits for the API and stores exactly what it returned.
 */
export function useRecurringTransactions(): UseRecurringTransactionsResult {
  const [templates, setTemplates] = useState<RecurringTransaction[]>([]);
  const [pending, setPending] = useState(true);
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    let isActive = true;

    getRecurringTransactions()
      .then((result) => {
        if (isActive) setTemplates([...result].sort(byNextOccurrence));
      })
      .catch((reason: unknown) => {
        console.error("Failed to fetch recurring transactions:", reason);
        if (isActive) {
          toast.error(
            errorMessage(reason, "Could not load recurring transactions."),
          );
        }
      })
      .finally(() => {
        if (isActive) setPending(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const markBusy = useCallback((id: string, busy: boolean): void => {
    setBusyIds((current) => {
      const next = new Set(current);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const upsertInPlace = useCallback((saved: RecurringTransaction): void => {
    setTemplates((current) => {
      const exists = current.some((template) => template.id === saved.id);
      const merged = exists
        ? current.map((template) =>
            template.id === saved.id ? saved : template,
          )
        : [...current, saved];

      return merged.sort(byNextOccurrence);
    });
  }, []);

  const addTemplate = useCallback(
    async (input: RecurringTransactionInput): Promise<boolean> => {
      try {
        upsertInPlace(await createRecurringTransaction(toUpsertPayload(input)));
        toast.success(`${input.name.trim()} added.`);
        return true;
      } catch (reason) {
        console.error("Failed to create recurring transaction:", reason);
        toast.error(
          errorMessage(reason, "Could not save this recurring transaction."),
        );
        return false;
      }
    },
    [upsertInPlace],
  );

  const editTemplate = useCallback(
    async (id: string, input: RecurringTransactionInput): Promise<boolean> => {
      markBusy(id, true);
      try {
        upsertInPlace(
          await updateRecurringTransaction(id, toUpsertPayload(input)),
        );
        toast.success(`${input.name.trim()} updated.`);
        return true;
      } catch (reason) {
        console.error("Failed to update recurring transaction:", reason);
        toast.error(
          errorMessage(reason, "Could not update this recurring transaction."),
        );
        return false;
      } finally {
        markBusy(id, false);
      }
    },
    [markBusy, upsertInPlace],
  );

  const runTransition = useCallback(
    async (id: string, transition: RecurringTransition): Promise<void> => {
      markBusy(id, true);
      try {
        const saved = await transitionRecurringTransaction(id, transition);
        upsertInPlace(saved);
        toast.success(`${saved.name} ${PAST_TENSE[transition]}.`);
      } catch (reason) {
        console.error(`Failed to ${transition} recurring transaction:`, reason);
        toast.error(
          errorMessage(
            reason,
            `Could not ${transition} this recurring transaction.`,
          ),
        );
      } finally {
        markBusy(id, false);
      }
    },
    [markBusy, upsertInPlace],
  );

  const removeTemplate = useCallback(
    async (id: string): Promise<void> => {
      markBusy(id, true);
      try {
        await deleteRecurringTransaction(id);
        setTemplates((current) =>
          current.filter((template) => template.id !== id),
        );
        toast.success("Recurring transaction deleted.");
      } catch (reason) {
        console.error("Failed to delete recurring transaction:", reason);
        // The 409 here is the useful one: the template has already generated
        // transactions, and the message says to cancel it instead.
        toast.error(
          errorMessage(reason, "Could not delete this recurring transaction."),
        );
      } finally {
        markBusy(id, false);
      }
    },
    [markBusy],
  );

  return {
    templates,
    pending,
    busyIds,
    addTemplate,
    editTemplate,
    runTransition,
    removeTemplate,
  };
}
