"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Category } from "@/app/(app)/categories/types/category.model";

export interface CategoryFilterChipsProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
  pending?: boolean;
}

/**
 * Toggle-tag row for narrowing the transaction list by category.
 *
 * Selection is additive (OR), and an empty selection means "show everything" —
 * so there is no separate "All" chip to keep in sync with the others.
 *
 * A switched-on chip fills with `primary`, which the theme resolves to near-black
 * in light mode and near-white in dark, so the contrast holds either way.
 */
export function CategoryFilterChips({
  categories,
  selectedIds,
  onToggle,
  pending = false,
}: CategoryFilterChipsProps): ReactElement | null {
  if (pending) {
    return (
      <div className="flex flex-wrap gap-2" aria-hidden>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const selected = new Set(selectedIds);

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
    >
      {categories.map((category) => {
        const isSelected = selected.has(category.id);

        return (
          <Button
            key={category.id}
            type="button"
            size="sm"
            variant={isSelected ? "default" : "outline"}
            aria-pressed={isSelected}
            onClick={() => onToggle(category.id)}
            className={cn(
              "h-8 rounded-full px-3.5 text-xs",
              isSelected ? "font-medium" : "text-foreground font-normal",
            )}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}
