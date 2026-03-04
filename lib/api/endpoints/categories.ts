/**
 * Category API endpoint constants.
 *
 * Replace placeholder paths with actual API routes
 * (e.g. "/api/v1/categories") when ready.
 */
export const CATEGORY_ENDPOINTS = {
  /** GET / POST – list or create categories. */
  list: "/api/categories",

  /** GET / PUT / DELETE – single category by ID. */
  byId: (id: string) => `/api/categories/${id}` as const,
} as const;
