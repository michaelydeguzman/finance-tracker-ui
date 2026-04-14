/**
 * Transaction API — client calls go to Next.js `/api/transactions/*` routes
 * (same pattern as `lib/api/categories.ts`).
 */
import { CategoryType } from "@/types/shared/enums";
import {
  TRANSACTION_ENDPOINTS,
  transactionListUrl,
  type TransactionListQuery,
} from "@/lib/api/endpoints";
import { apiFetch } from "@/lib/api/config";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import type {
  TransactionResponse,
  UpsertTransactionRequest,
} from "@/app/transactions/types/transaction.api";

const mapTransaction = (transaction: TransactionResponse): Transaction => ({
  ...transaction,
  // Backend may serialize enums as numbers ("0"), names ("Income"), etc.
  // Normalize so dashboard comparisons against `CategoryType` work reliably.
  categoryType: (() => {
    const raw = transaction.categoryType as unknown;
    if (typeof raw === "string") {
      const s = raw.trim().toLowerCase();
      if (s === "income") return CategoryType.Income;
      if (s === "expense") return CategoryType.Expense;
      return Number(raw) as CategoryType;
    }
    return Number(raw) as CategoryType;
  })(),
  amount: Number(transaction.amount),
  transactionDate: new Date(transaction.transactionDate),
  createdAt: new Date(transaction.createdAt),
});

export type { TransactionListQuery };

export const createTransaction = async (
  payload: UpsertTransactionRequest,
): Promise<Transaction> =>
  mapTransaction(
    await apiFetch<TransactionResponse>(TRANSACTION_ENDPOINTS.list, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const getTransactions = async (
  query?: TransactionListQuery,
  init?: RequestInit,
): Promise<Transaction[]> =>
  (
    await apiFetch<TransactionResponse[]>(transactionListUrl(query), init)
  ).map(mapTransaction);

export const getTransaction = async (id: string): Promise<Transaction> =>
  mapTransaction(
    await apiFetch<TransactionResponse>(TRANSACTION_ENDPOINTS.byId(id)),
  );

export const getTransactionsByType = async (
  type: CategoryType,
  init?: RequestInit,
): Promise<Transaction[]> => getTransactions({ categoryType: type }, init);

export const updateTransaction = async (
  id: string,
  payload: UpsertTransactionRequest,
): Promise<Transaction> =>
  mapTransaction(
    await apiFetch<TransactionResponse>(TRANSACTION_ENDPOINTS.byId(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const deleteTransaction = async (id: string): Promise<void> =>
  apiFetch<void>(TRANSACTION_ENDPOINTS.byId(id), {
    method: "DELETE",
  });
