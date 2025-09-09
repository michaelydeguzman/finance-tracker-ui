"use client";

import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import CategoryList from "../category-list/category-list";

export default function IncomeCategoryList() {
  const { incomeCategories, addIncomeCategory } = useIncomeCategories();

  return (
    <CategoryList
      label="Income Categories"
      data={incomeCategories}
      onAdd={addIncomeCategory}
    />
  );
}
