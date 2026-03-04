import type { CreateCategoryRequest } from "@/app/categories/_types/category.api";
import type { Category } from "@/app/categories/_types/category.model";
import type { CategoryType } from "@/types/shared/enums";
import { CATEGORY_ENDPOINTS } from "@/lib/api/endpoints";
import { apiFetch } from "@/lib/api/config";

/** Create a new category. */
export const createCategory = async (
  payload: CreateCategoryRequest,
): Promise<Category> =>
  apiFetch<Category>(CATEGORY_ENDPOINTS.list, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

/** Fetch all categories, or a single category by ID. */
export const getCategories = async (id?: string): Promise<Category[]> =>
  apiFetch<Category[]>(
    id ? CATEGORY_ENDPOINTS.byId(id) : CATEGORY_ENDPOINTS.list,
  );

/** Fetch categories filtered by type (Income / Expense). */
export const getCategoriesByType = async (
  type: CategoryType,
): Promise<Category[]> => apiFetch<Category[]>(CATEGORY_ENDPOINTS.byType(type));
