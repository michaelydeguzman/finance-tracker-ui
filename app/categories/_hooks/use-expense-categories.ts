"use client";
import { Category, CategoryTypes } from "../_types/category.model";
import { CategoryConstants } from "../_data/category-constants";
import { useEffect, useState } from "react";

export function useExpenseCategories() {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);

  useEffect(() => {
    setExpenseCategories(CategoryConstants.EXPENSE_CATEGORIES);
  }, []);

  const addExpenseCategory = (category: string): void => {
    setExpenseCategories((prev) => {
      const lower = category.toLowerCase();

      if (prev.some((c) => c.name.toLowerCase() === lower)) {
        alert(`Category "${category}" already exists!`);
        return prev; // don't add
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: category,
          categoryType: CategoryTypes.EXPENSE,
          createdAt: new Date(),
          isActive: true,
        },
      ];
    });
  };

  return {
    expenseCategories,
    addExpenseCategory,
  };
}
