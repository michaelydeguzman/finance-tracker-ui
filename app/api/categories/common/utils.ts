import { CategoryType } from "@/types/shared/enums";

export const isValidCategoryType = (value: unknown): value is CategoryType =>
  Object.values(CategoryType).includes(value as CategoryType);
