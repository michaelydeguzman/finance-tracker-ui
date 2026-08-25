"use client";

import { useEffect } from "react";
import { toast } from "sonner";
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

const typeLabel = (categoryType: CategoryType): string =>
  categoryType === CategoryType.Income ? "income" : "expense";

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
          name: category.name ?? "",
          categoryType: category.categoryType ?? categoryType,
        }),
      (id) => deleteCategory(id),
      "Category",
    );

  useEffect(() => {
    let isActive = true;

    getCategoriesByType(categoryType)
      .then((result) => {
        if (isActive) setData(result);
      })
      .catch((error) => {
        console.error(
          `Failed to fetch ${typeLabel(categoryType)} categories:`,
          error,
        );
        if (isActive) {
          // Previously this only reached the console, so a failed load looked
          // identical to "you have no categories yet".
          toast.error(`Could not load ${typeLabel(categoryType)} categories.`);
        }
      });

    return () => {
      isActive = false;
    };
  }, [categoryType, setData]);

  const addCategoryHandler = (name: string): void => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Category name cannot be empty.");
      return;
    }

    if (data.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error(`Category "${trimmedName}" already exists.`);
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
      toast.error("Category name cannot be empty.");
      return;
    }

    const isDuplicate = data.some(
      (c) => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      toast.error(`Category "${trimmedName}" already exists.`);
      return;
    }

    updateItem(id, { name: trimmedName, categoryType });
  };

  return {
    categories: data,
    pending,
    addCategory: addCategoryHandler,
    updateCategory: updateCategoryHandler,
    // Confirmation lives in the UI layer (`ConfirmDeleteDialog`), not a
    // blocking `confirm()` call inside the data hook.
    deleteCategory: deleteItem,
  };
}
