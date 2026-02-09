"use client";

import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { createCategory } from "@/lib/api/categories";
import { Category, CategoryTypes } from "../_types/category.model";
import { CategoryConstants } from "../_data/category-constants";

const INITIAL_INCOME_CATEGORIES = CategoryConstants.INCOME_CATEGORIES;

export function useIncomeCategories() {
  const { data, pending, addItem, updateItem, deleteItem } =
    useOptimisticList<Category>(
      INITIAL_INCOME_CATEGORIES,
      (category) =>
        createCategory({
          name: category.name,
          categoryType: category.categoryType,
          isActive: category.isActive,
        }),
      async () => {
        throw new Error("Updating income categories is not implemented yet.");
      },
      async () => {
        throw new Error("Deleting income categories is not implemented yet.");
      },
    );

  const addIncomeCategory = (category: string): void => {
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
      categoryType: CategoryTypes.INCOME,
      createdAt: new Date(),
      isActive: true,
    });
  };

  const updateIncomeCategory = (id: string, category: string): void => {
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

  const deleteIncomeCategory = (id: string): void => {
    const category = data.find((item) => item.id === id);
    const label = category?.name ?? "this category";

    if (!confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    deleteItem(id);
  };

  return {
    incomeCategories: data,
    addIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,
    pending,
  };
}
