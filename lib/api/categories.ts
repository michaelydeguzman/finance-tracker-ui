import type { UpsertCategoryRequest } from "@/app/(app)/categories/types/category.api";
import type { Category } from "@/app/(app)/categories/types/category.model";
import type { CategoryType } from "@/types/shared/enums";
import { CATEGORY_ENDPOINTS } from "@/lib/api/endpoints";
import { apiFetch } from "@/lib/api/config";

export const createCategory = async (
  payload: UpsertCategoryRequest,
): Promise<Category> =>
  apiFetch<Category>(CATEGORY_ENDPOINTS.list, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const getCategories = async (id?: string): Promise<Category[]> =>
  apiFetch<Category[]>(
    id ? CATEGORY_ENDPOINTS.byId(id) : CATEGORY_ENDPOINTS.list,
  );

export const getCategoriesByType = async (
  type: CategoryType,
): Promise<Category[]> => apiFetch<Category[]>(CATEGORY_ENDPOINTS.byType(type));

export const updateCategory = async (
  id: string,
  payload: UpsertCategoryRequest,
): Promise<Category> =>
  apiFetch<Category>(CATEGORY_ENDPOINTS.byId(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const deleteCategory = async (id: string): Promise<void> =>
  apiFetch<void>(CATEGORY_ENDPOINTS.byId(id), {
    method: "DELETE",
  });
