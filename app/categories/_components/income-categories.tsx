"use client";

import { useIncomeCategories } from "../_hooks/use-income-categories";
import CategoryList from "@/components/categories/category-list";

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
