"use client";

import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import CategoryList from "../category-list/category-list";

export default function ExpenseCategoryList() {
  const { expenseCategories, addExpenseCategory } = useExpenseCategories();

  return (
    <CategoryList
      label="Expense Categories"
      data={expenseCategories}
      onAdd={addExpenseCategory}
      categoryType="expense"
    />
  );
}
