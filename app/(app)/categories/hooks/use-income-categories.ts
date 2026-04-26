"use client";

import { CategoryType } from "@/types/shared/enums";
import { useCategories } from "./use-categories";

export function useIncomeCategories() {
  const { categories, pending, addCategory, updateCategory, deleteCategory } =
    useCategories(CategoryType.Income);

  return {
    incomeCategories: categories,
    addIncomeCategory: addCategory,
    updateIncomeCategory: updateCategory,
    deleteIncomeCategory: deleteCategory,
    pending,
  };
}
