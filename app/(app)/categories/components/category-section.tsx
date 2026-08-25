"use client";

import type { CategoryType } from "@/types/shared/enums";
import { useCategories } from "../hooks/use-categories";
import CategoryList from "./category-list";

/**
 * One category table, bound to a category type. Replaces the near-identical
 * `IncomeCategoryList` / `ExpenseCategoryList` wrapper pair.
 */
export default function CategorySection({
  categoryType,
  label,
}: {
  categoryType: CategoryType;
  label: string;
}) {
  const { categories, pending, addCategory, updateCategory, deleteCategory } =
    useCategories(categoryType);

  return (
    <CategoryList
      label={label}
      data={categories}
      onAdd={addCategory}
      onUpdate={updateCategory}
      onDelete={deleteCategory}
      pending={pending}
    />
  );
}
