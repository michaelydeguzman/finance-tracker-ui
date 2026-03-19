/**
 * Client-facing category endpoint constants.
 *
 * These are relative paths that hit Next.js API route handlers,
 * which in turn proxy requests to the real backend (API_URL).
 */
export const CATEGORY_ENDPOINTS = {
  /** GET / POST – list or create categories. */
  list: "/api/categories",

  /** GET / PUT / DELETE – single category by ID. */
  byId: (id: string) => `/api/categories/${id}` as const,

  /** GET – categories filtered by type (0 = Income, 1 = Expense). */
  byType: (type: number) => `/api/categories?categoryType=${type}` as const,
} as const;
