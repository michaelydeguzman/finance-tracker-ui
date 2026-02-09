"use client";

import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { createCategory } from "@/lib/api/categories";
import { Category, CategoryTypes } from "../_types/category.model";
import { CategoryConstants } from "../_data/category-constants";

const INITIAL_EXPENSE_CATEGORIES = CategoryConstants.EXPENSE_CATEGORIES;

export function useExpenseCategories() {
  const { data, pending, addItem, updateItem, deleteItem } =
    useOptimisticList<Category>(
      INITIAL_EXPENSE_CATEGORIES,
      (category) =>
        createCategory({
          name: category.name,
          categoryType: category.categoryType,
          isActive: category.isActive,
        }),
      async () => {
        throw new Error("Updating expense categories is not implemented yet.");
      },
      async () => {
        throw new Error("Deleting expense categories is not implemented yet.");
      },
    );

  const addExpenseCategory = (category: string): void => {
    const trimmedCategory = category.trim();

    if (!trimmedCategory) {
      alert("Category name cannot be empty.");
      return;
    }

    const lower = trimmedCategory.toLowerCase();

    if (data.some((c) => c.name.toLowerCase() === lower)) {
      alert(`Category "${trimmedCategory}" already exists!`);
      return;
    }

    addItem({
      name: trimmedCategory,
      categoryType: CategoryTypes.EXPENSE,
      createdAt: new Date(),
      isActive: true,
    });
  };

  const updateExpenseCategory = (id: string, category: string): void => {
    const trimmedCategory = category.trim();

    if (!trimmedCategory) {
      alert("Category name cannot be empty.");
      return;
    }

    const lower = trimmedCategory.toLowerCase();

    if (data.some((c) => c.id !== id && c.name.toLowerCase() === lower)) {
      alert(`Category "${trimmedCategory}" already exists!`);
      return;
    }

    updateItem(id, { name: trimmedCategory });
  };

  const deleteExpenseCategory = (id: string): void => {
    const category = data.find((item) => item.id === id);
    const label = category?.name ?? "this category";

    if (!confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    deleteItem(id);
  };

  return {
    expenseCategories: data,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    pending,
  };
}
