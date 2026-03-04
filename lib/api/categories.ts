import type {
  CategoryResponse,
  CreateCategoryRequest,
} from "@/app/categories/_types/category.api";
import type { Category } from "@/app/categories/_types/category.model";
import { CATEGORY_ENDPOINTS } from "@/lib/api/endpoints";

const getErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data?.error ?? "Failed to create category.";
  } catch {
    return "Failed to create category.";
  }
};

export const createCategory = async (
  payload: CreateCategoryRequest,
): Promise<Category> => {
  const response = await fetch(CATEGORY_ENDPOINTS.list, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const data = (await response.json()) as CategoryResponse;

  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};
