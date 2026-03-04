/**
 * Transaction API endpoint constants.
 *
 * Replace placeholder paths with actual API routes
 * (e.g. "/api/v1/transactions") when ready.
 */
export const TRANSACTION_ENDPOINTS = {
  /** GET / POST – list or create transactions. */
  list: "/api/transactions",

  /** GET / PUT / DELETE – single transaction by ID. */
  byId: (id: string) => `/api/transactions/${id}` as const,
} as const;
