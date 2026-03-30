/**
 * Client-facing transaction endpoint constants.
 *
 * These are relative paths that hit Next.js API route handlers,
 * which in turn proxy requests to the real backend (API_URL).
 */
import { CategoryType } from "@/types/shared/enums";

export const TRANSACTION_ENDPOINTS = {
  /** GET / POST — list or create transactions. */
  list: "/api/transactions",

  /** GET / PUT / DELETE — single transaction by ID. */
  byId: (id: string) => `/api/transactions/${id}` as const,

  /** GET — transactions filtered by category type (income / expense). */
  byCategoryType: (type: CategoryType) =>
    `/api/transactions?categoryType=${type}` as const,
} as const;
