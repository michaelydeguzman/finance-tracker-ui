"use client";

import { CategoryType } from "@/types/shared/enums";
import {
  useTransactions,
  type TransactionInput as IncomeTransactionInput,
} from "../../../transactions/hooks/use-transactions";

export function useIncomeTransactions() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    pending,
  } = useTransactions(CategoryType.Income);

  return {
    incomeTransactions: transactions,
    addIncomeTransaction: addTransaction,
    updateIncomeTransaction: updateTransaction,
    deleteIncomeTransaction: deleteTransaction,
    pending,
  };
}
