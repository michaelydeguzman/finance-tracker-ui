"use client";

import { useEffect } from "react";
import { useOptimisticList } from "@/hooks/use-optimistic-list";
import {
  createCategory,
  deleteCategory,
  getCategoriesByType,
  updateCategory,
} from "@/lib/api/categories";
import { CategoryType } from "@/types/shared/enums";
import type { Category } from "../types/category.model";

export function useExpenseCategories() {
  const { data, pending, setData, addItem, updateItem, deleteItem } =
    useOptimisticList<Category>(
      [],
      (category) =>
        createCategory({
          name: category.name,
          categoryType: category.categoryType,
        }),
      (id, category) =>
        updateCategory(id, {
          name: category.name,
          categoryType: category.categoryType,
        } as Category),
      (id) => deleteCategory(id),
      "Category",
    );

  useEffect(() => {
    getCategoriesByType(CategoryType.Expense)
      .then(setData)
      .catch((error) =>
        console.error("Failed to fetch expense categories:", error),
      );
  }, [setData]);

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
      categoryType: CategoryType.Expense,
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

    updateItem(id, {
      name: trimmedCategory,
      categoryType: CategoryType.Expense,
    });
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
