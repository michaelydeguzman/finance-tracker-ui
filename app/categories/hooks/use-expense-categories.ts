"use client";

import { CategoryType } from "@/types/shared/enums";
import { useCategories } from "./use-categories";

export function useExpenseCategories() {
  const { categories, pending, addCategory, updateCategory, deleteCategory } =
    useCategories(CategoryType.Expense);

  return {
    expenseCategories: categories,
    addExpenseCategory: addCategory,
    updateExpenseCategory: updateCategory,
    deleteExpenseCategory: deleteCategory,
    pending,
  };
}
