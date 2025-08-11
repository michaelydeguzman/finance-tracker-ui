"use client";
import { Constants } from "@/constants";

import { useEffect, useState } from "react";

export function useExpenseCategories() {
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);

  useEffect(() => {
    setExpenseCategories(Constants.EXPENSE_CATEGORIES);
  }, []);

  const addExpenseCategory = (category: string) => {
    setExpenseCategories((prev) => {
      const lower = category.toLowerCase();

      if (prev.some((c) => c.toLowerCase() === lower)) {
        alert(`Category "${category}" already exists!`);
        return prev; // don't add
      }

      return [...prev, category];
    });
  };

  return {
    expenseCategories,
    addExpenseCategory,
  };
}
