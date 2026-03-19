import type { CategoryType } from "@/types/shared/enums";
import { TRANSACTION_ENDPOINTS } from "@/lib/api/endpoints";
import { apiFetch } from "@/lib/api/config";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import type {
  TransactionResponse,
  UpsertTransactionRequest,
} from "@/app/transactions/types/transaction.api";

const mapTransaction = (transaction: TransactionResponse): Transaction => ({
  ...transaction,
  transactionDate: new Date(transaction.transactionDate),
  createdAt: new Date(transaction.createdAt),
});

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

export const getTransactions = async (): Promise<Transaction[]> =>
  (await apiFetch<TransactionResponse[]>(TRANSACTION_ENDPOINTS.list)).map(
    mapTransaction,
  );

export const getTransaction = async (id: string): Promise<Transaction> =>
  mapTransaction(
    await apiFetch<TransactionResponse>(TRANSACTION_ENDPOINTS.byId(id)),
  );

export const getTransactionsByType = async (
  type: CategoryType,
): Promise<Transaction[]> =>
  (
    await apiFetch<TransactionResponse[]>(
      TRANSACTION_ENDPOINTS.byCategoryType(type),
    )
  ).map(mapTransaction);

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
