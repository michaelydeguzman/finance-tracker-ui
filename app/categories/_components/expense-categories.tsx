"use client";

import { useExpenseCategories } from "../_hooks/use-expense-categories";
import CategoryList from "@/components/categories/category-list";

export default function ExpenseCategoryList() {
  const { expenseCategories, addExpenseCategory, pending } =
    useExpenseCategories();

  return (
    <CategoryList
      label="Expense Categories"
      data={expenseCategories}
      onAdd={addExpenseCategory}
      pending={pending}
    />
  );
}
