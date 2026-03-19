"use client";

import { useExpenseCategories } from "../hooks/use-expense-categories";
import CategoryList from "@/app/categories/components/category-list";

export default function ExpenseCategoryList() {
  const {
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    pending,
  } = useExpenseCategories();

  return (
    <CategoryList
      label="Expense Categories"
      data={expenseCategories}
      onAdd={addExpenseCategory}
      onUpdate={updateExpenseCategory}
      onDelete={deleteExpenseCategory}
      pending={pending}
    />
  );
}
