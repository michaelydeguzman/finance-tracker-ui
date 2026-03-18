import { CategoryType } from "@/types/shared/enums";

export const TRANSACTION_ENDPOINTS = {
  list: "/api/transactions",
  byId: (id: string) => `/api/transactions/${id}` as const,
  byCategoryType: (type: CategoryType) =>
    `/api/transactions?type=${type}` as const,
} as const;
