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

interface UseCategoriesResult {
  categories: Category[];
  pending: boolean;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
}

export function useCategories(categoryType: CategoryType): UseCategoriesResult {
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
    getCategoriesByType(categoryType)
      .then(setData)
      .catch((error) => {
        const label =
          categoryType === CategoryType.Income
            ? "income"
            : categoryType === CategoryType.Expense
              ? "expense"
              : "selected";
        console.error(`Failed to fetch ${label} categories:`, error);
      });
  }, [categoryType, setData]);

  const addCategoryHandler = (name: string): void => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Category name cannot be empty.");
      return;
    }

    const lower = trimmedName.toLowerCase();

    if (data.some((c) => c.name.toLowerCase() === lower)) {
      alert(`Category "${trimmedName}" already exists!`);
      return;
    }

    addItem({
      name: trimmedName,
      categoryType,
      createdAt: new Date(),
      isActive: true,
    });
  };

  const updateCategoryHandler = (id: string, name: string): void => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Category name cannot be empty.");
      return;
    }

    const lower = trimmedName.toLowerCase();

    if (data.some((c) => c.id !== id && c.name.toLowerCase() === lower)) {
      alert(`Category "${trimmedName}" already exists!`);
      return;
    }

    updateItem(id, {
      name: trimmedName,
      categoryType,
    });
  };

  const deleteCategoryHandler = (id: string): void => {
    const category = data.find((item) => item.id === id);
    const label = category?.name ?? "this category";

    if (!confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    deleteItem(id);
  };

  return {
    categories: data,
    pending,
    addCategory: addCategoryHandler,
    updateCategory: updateCategoryHandler,
    deleteCategory: deleteCategoryHandler,
  };
}

