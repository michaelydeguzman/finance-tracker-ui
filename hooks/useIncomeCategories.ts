"use client";
import { Category, CategoryTypes } from "@/components/templates/category.model";
import { Constants } from "@/constants";
import { useEffect, useState } from "react";

export function useIncomeCategories() {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(
    Constants.INCOME_CATEGORIES ?? [],
  );

  const addIncomeCategory = (category: string): void => {
    setIncomeCategories((prev: Category[]) => {
      const lower = category.toLowerCase();

      if (prev.some((c) => c.name.toLowerCase() === lower)) {
        alert(`Category "${category}" already exists!`);
        return prev;
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: category,
          categoryType: CategoryTypes.INCOME,
          createdAt: new Date(),
          isActive: true,
        },
      ];
    });
  };

  return {
    incomeCategories,
    addIncomeCategory,
  };
}
