"use client";

import { useExpenseCategories } from "../_hooks/use-expense-categories";
import CategoryList from "@/app/categories/_components/category-list";

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
