"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useOptimisticList } from "@/hooks/use-optimistic-list";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByType,
  updateTransaction,
} from "@/lib/api/transactions";
import { CategoryType } from "@/types/shared/enums";
import type { Transaction } from "../types/transaction.model";
import type { UpsertTransactionRequest } from "../types/transaction.api";

const DEFAULT_CREATED_BY = "finance-tracker-ui";

export interface TransactionInput {
  name: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  amount: number;
  transactionDate: Date;
  frequencyId?: string | null;
  frequencyName?: string | null;
  createdBy?: string;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  pending: boolean;
  addTransaction: (input: TransactionInput) => void;
  updateTransaction: (id: string, input: Partial<TransactionInput>) => void;
  deleteTransaction: (id: string) => void;
}

const toUpsertPayload = (
  transaction: Omit<Transaction, "id"> | Partial<Transaction>,
): UpsertTransactionRequest => ({
  name: transaction.name ?? "",
  categoryId: transaction.categoryId ?? "",
  description: transaction.description ?? null,
  amount: transaction.amount ?? 0,
  frequencyId: transaction.frequencyId ?? null,
  transactionDate: transaction.transactionDate ?? new Date(),
  createdBy: transaction.createdBy ?? DEFAULT_CREATED_BY,
});

const createOptimisticTransaction = (
  input: TransactionInput,
  categoryType: CategoryType,
): Omit<Transaction, "id"> => ({
  name: input.name.trim(),
  categoryId: input.categoryId,
  categoryName: input.categoryName.trim(),
  categoryType,
  description: input.description?.trim() ?? "",
  amount: input.amount,
  transactionDate: input.transactionDate,
  frequencyId: input.frequencyId ?? null,
  frequencyName: input.frequencyName ?? null,
  createdAt: new Date(),
  createdBy: input.createdBy?.trim() || DEFAULT_CREATED_BY,
});

function formatTypeLabel(categoryType: CategoryType): string {
  if (categoryType === CategoryType.Income) return "income";
  if (categoryType === CategoryType.Expense) return "expense";
  return "selected";
}

export function useTransactions(
  categoryType: CategoryType,
): UseTransactionsResult {
  const [isFetching, setIsFetching] = useState(true);
  const { data, pending, setData, addItem, updateItem, deleteItem } =
    useOptimisticList<Transaction>(
      [],
      (newTransaction) => createTransaction(toUpsertPayload(newTransaction)),
      (id, transaction) => updateTransaction(id, toUpsertPayload(transaction)),
      (id) => deleteTransaction(id),
      "Transaction",
    );

  useEffect(() => {
    let isActive = true;

    Promise.resolve().then(() => {
      if (isActive) setIsFetching(true);
    });

    getTransactionsByType(categoryType)
      .then((result) => {
        if (!isActive) return;
        setData(result);
      })
      .catch((error) => {
        console.error(
          `Failed to fetch ${formatTypeLabel(categoryType)} transactions:`,
          error,
        );
        if (isActive) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load transactions.";
          toast.error(message);
        }
      })
      .finally(() => {
        if (isActive) setIsFetching(false);
      });

    return () => {
      isActive = false;
    };
  }, [categoryType, setData]);

  const addTransactionHandler = (input: TransactionInput): void => {
    const name = input.name.trim();

    if (!name) {
      toast.error("Transaction name cannot be empty.");
      return;
    }

    if (!input.categoryId.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    addItem(createOptimisticTransaction({ ...input, name }, categoryType));
  };

  const updateTransactionHandler = (
    id: string,
    input: Partial<TransactionInput>,
  ): void => {
    const existing = data.find((transaction) => transaction.id === id);

    if (!existing) {
      return;
    }

    const nextName = input.name?.trim() ?? existing.name;
    const nextCategoryId = input.categoryId ?? existing.categoryId;
    const nextAmount = input.amount ?? existing.amount;

    if (!nextName) {
      toast.error("Transaction name cannot be empty.");
      return;
    }

    if (!nextCategoryId.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    updateItem(id, {
      name: nextName,
      categoryId: nextCategoryId,
      categoryName: input.categoryName?.trim() ?? existing.categoryName,
      categoryType,
      description: input.description?.trim() ?? existing.description,
      amount: nextAmount,
      transactionDate: input.transactionDate ?? existing.transactionDate,
      ...(input.frequencyId === undefined
        ? {}
        : { frequencyId: input.frequencyId }),
      ...(input.frequencyName === undefined
        ? {}
        : { frequencyName: input.frequencyName }),
      createdBy: input.createdBy?.trim() || existing.createdBy,
    });
  };

  const deleteTransactionHandler = (id: string): void => {
    deleteItem(id);
  };

  return {
    transactions: data,
    addTransaction: addTransactionHandler,
    updateTransaction: updateTransactionHandler,
    deleteTransaction: deleteTransactionHandler,
    pending: pending || isFetching,
  };
}
