"use client";

import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { Category, CategoryTypes } from "../_types/category.model";
import { CategoryConstants } from "../_data/category-constants";

const INITIAL_EXPENSE_CATEGORIES = CategoryConstants.EXPENSE_CATEGORIES;

const simulateNetworkLatency = (delay = 400) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export function useExpenseCategories() {
  const { data, pending, addItem } = useOptimisticList<Category>(
    INITIAL_EXPENSE_CATEGORIES,
    async (category) => {
      await simulateNetworkLatency();
      return {
        ...category,
        id: crypto.randomUUID(),
      } satisfies Category;
    },
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

  return {
    expenseCategories: data,
    addExpenseCategory,
    pending,
  };
}
