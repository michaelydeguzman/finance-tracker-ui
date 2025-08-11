"use client";
import { Constants } from "@/constants";

import { useEffect, useState } from "react";

export function useIncomeCategories() {
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);

  useEffect(() => {
    setIncomeCategories(Constants.INCOME_CATEGORIES);
  }, []);

  const addIncomeCategory = (category: string) => {
    setIncomeCategories((prev) => {
      const lower = category.toLowerCase();

      if (prev.some((c) => c.toLowerCase() === lower)) {
        alert(`Category "${category}" already exists!`);
        return prev; // don't add
      }

      return [...prev, category];
    });
  };

  return {
    incomeCategories,
    addIncomeCategory,
  };
}
