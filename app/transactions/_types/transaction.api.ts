export interface TransactionResponse {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  frequencyId: string | null;
  frequencyName: string | null;
  createdAt: string;
  createdBy: string;
}

export interface CreateTransactionRequest {
  name: string;
  categoryId: string;
  description?: string | null;
  amount: number;
  frequencyId?: string | null;
  createdBy: string;
}
