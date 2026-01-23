"use client";
import { Category, CategoryTypes } from "@/components/templates/category.model";
import { Constants } from "@/constants";

import { useEffect, useState } from "react";

export function useExpenseCategories() {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(
    Constants.EXPENSE_CATEGORIES ?? [],
  );

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
