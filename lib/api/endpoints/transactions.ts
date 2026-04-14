/**
 * Client-facing transaction endpoint constants.
 *
 * These are relative paths that hit Next.js API route handlers,
 * which in turn proxy requests to the real backend (API_URL).
 */
import { CategoryType } from "@/types/shared/enums";

export type TransactionListQuery = {
  from?: string;
  to?: string;
  categoryType?: CategoryType;
  categoryIds?: string[];
  page?: number;
  pageSize?: number;
};

export const TRANSACTION_ENDPOINTS = {
  /**
   * GET / POST — list or create transactions.
   * GET accepts optional `categoryType`, paired `from`/`to` (ISO dates), repeated
   * `categoryIds`, and paired `page`/`pageSize` — see `transactionListUrl`.
   */
  list: "/api/transactions",

  /** GET / PUT / DELETE — single transaction by ID. */
  byId: (id: string) => `/api/transactions/${id}` as const,

  /** GET — transactions filtered by category type (income / expense). */
  byCategoryType: (type: CategoryType) =>
    `/api/transactions?categoryType=${type}` as const,
} as const;

/**
 * Builds the Next.js-relative list URL including supported list filters
 * (must match BFF query validation).
 */
export function transactionListUrl(query?: TransactionListQuery): string {
  if (query === undefined) {
    return TRANSACTION_ENDPOINTS.list;
  }

  const p = new URLSearchParams();

  if (query.categoryType !== undefined) {
    p.set("categoryType", String(query.categoryType));
  }
  if (query.from !== undefined && query.to !== undefined) {
    p.set("from", query.from);
    p.set("to", query.to);
  }
  if (query.categoryIds !== undefined) {
    for (const id of query.categoryIds) {
      p.append("categoryIds", id);
    }
  }
  if (query.page !== undefined && query.pageSize !== undefined) {
    p.set("page", String(query.page));
    p.set("pageSize", String(query.pageSize));
  }

  const qs = p.toString();
  return qs === ""
    ? TRANSACTION_ENDPOINTS.list
    : `${TRANSACTION_ENDPOINTS.list}?${qs}`;
}
