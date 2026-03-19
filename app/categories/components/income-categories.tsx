"use client";

import { useIncomeCategories } from "../hooks/use-income-categories";
import CategoryList from "@/app/categories/components/category-list";

export default function IncomeCategoryList() {
  const {
    incomeCategories,
    addIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,
    pending,
  } = useIncomeCategories();

  return (
    <CategoryList
      label="Income Categories"
      data={incomeCategories}
      onAdd={addIncomeCategory}
      onUpdate={updateIncomeCategory}
      onDelete={deleteIncomeCategory}
      pending={pending}
    />
  );
}
