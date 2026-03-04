import type { CategoryType } from "@/types/shared/enums";

export interface CreateCategoryRequest {
  name: string;
  categoryType: CategoryType;
}

export interface CategoryResponse {
  id: string;
  name: string;
  categoryType: CategoryType;
  createdAt: string;
  isActive: boolean;
}
