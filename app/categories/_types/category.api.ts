import type { CategoryType } from "@/types/shared/enums";

export interface CreateCategoryRequest {
  name: string;
  categoryType: CategoryType;
}
