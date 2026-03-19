"use client";

import { CategoryType } from "@/types/shared/enums";
import { useTransactions } from "../../transactions/hooks/use-transactions";

export function useExpenseTransactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, pending } =
    useTransactions(CategoryType.Expense);

  return {
    expenseTransactions: transactions,
    addExpenseTransaction: addTransaction,
    updateExpenseTransaction: updateTransaction,
    deleteExpenseTransaction: deleteTransaction,
    pending,
  };
}

