"use client";

import { useEffect } from "react";
import { useOptimisticList } from "@/hooks/use-optimistic-list";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByType,
  updateTransaction,
} from "@/lib/api/transactions";
import { CategoryType } from "@/types/shared/enums";
import type { Transaction } from "../../transactions/types/transaction.model";
import type { UpsertTransactionRequest } from "../../transactions/types/transaction.api";

const DEFAULT_CREATED_BY = "finance-tracker-ui";

export interface IncomeTransactionInput {
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
  input: IncomeTransactionInput,
): Omit<Transaction, "id"> => ({
  name: input.name.trim(),
  categoryId: input.categoryId,
  categoryName: input.categoryName.trim(),
  categoryType: CategoryType.Income,
  description: input.description?.trim() ?? "",
  amount: input.amount,
  transactionDate: input.transactionDate,
  frequencyId: input.frequencyId ?? null,
  frequencyName: input.frequencyName ?? null,
  createdAt: new Date(),
  createdBy: input.createdBy?.trim() || DEFAULT_CREATED_BY,
});

export function useIncomeTransactions() {
  const { data, pending, setData, addItem, updateItem, deleteItem } =
    useOptimisticList<Transaction>(
      [],
      (newTransaction) => createTransaction(toUpsertPayload(newTransaction)),
      (id, transaction) => updateTransaction(id, toUpsertPayload(transaction)),
      (id) => deleteTransaction(id),
      "Transaction",
    );

  useEffect(() => {
    getTransactionsByType(CategoryType.Income)
      .then(setData)
      .catch((error) =>
        console.error("Failed to fetch income transactions:", error),
      );
  }, [setData]);

  const addIncomeTransaction = (input: IncomeTransactionInput): void => {
    const name = input.name.trim();

    if (!name) {
      alert("Transaction name cannot be empty.");
      return;
    }

    if (!input.categoryId.trim()) {
      alert("Category is required.");
      return;
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    addItem(createOptimisticTransaction({ ...input, name }));
  };

  const updateIncomeTransaction = (
    id: string,
    input: Partial<IncomeTransactionInput>,
  ): void => {
    const existing = data.find((transaction) => transaction.id === id);

    if (!existing) {
      return;
    }

    const nextName = input.name?.trim() ?? existing.name;
    const nextCategoryId = input.categoryId ?? existing.categoryId;
    const nextAmount = input.amount ?? existing.amount;

    if (!nextName) {
      alert("Transaction name cannot be empty.");
      return;
    }

    if (!nextCategoryId.trim()) {
      alert("Category is required.");
      return;
    }

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    updateItem(id, {
      name: nextName,
      categoryId: nextCategoryId,
      categoryName: input.categoryName?.trim() ?? existing.categoryName,
      categoryType: CategoryType.Income,
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

  const deleteIncomeTransaction = (id: string): void => {
    const transaction = data.find((item) => item.id === id);
    const label = transaction?.name ?? "this transaction";

    if (!confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    deleteItem(id);
  };

  return {
    incomeTransactions: data,
    addIncomeTransaction,
    updateIncomeTransaction,
    deleteIncomeTransaction,
    pending,
  };
}
