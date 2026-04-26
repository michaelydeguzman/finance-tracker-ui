import type { CategoryType } from "@/types/shared/enums";

export interface UpsertCategoryRequest {
  name: string;
  categoryType: CategoryType;
}
