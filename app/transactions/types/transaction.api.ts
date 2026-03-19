import type { CategoryType } from "@/types/shared/enums";

export interface TransactionResponse {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  description: string;
  amount: number;
  transactionDate: string;
  frequencyId: string | null;
  frequencyName: string | null;
  createdAt: string;
  createdBy: string;
}

export interface UpsertTransactionRequest {
  name: string;
  categoryId: string;
  description?: string | null;
  amount: number;
  frequencyId?: string | null;
  transactionDate: Date;
  createdBy: string;
}
