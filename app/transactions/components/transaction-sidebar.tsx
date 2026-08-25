"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StickyRightSidebar from "@/components/layout/sticky-right-sidebar";
import type { Category } from "@/app/(app)/categories/types/category.model";
import type {
  QuickActionItem,
  TransactionSummaryItem,
} from "../types/transaction.model";
import { CategoryFilterChips } from "./category-filter-chips";

const TREND_META = {
  up: { icon: ArrowUpRightIcon, color: "text-emerald-600" },
  down: { icon: ArrowDownRightIcon, color: "text-rose-600" },
  flat: { icon: MinusIcon, color: "text-muted-foreground" },
} as const;

interface TransactionSidebarProps {
  summaryHeading: string;
  summary: TransactionSummaryItem[];
  actions: QuickActionItem[];
  showTrends: boolean;
  categories: Category[];
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
  categoriesPending: boolean;
}

export function TransactionSidebar({
  summaryHeading,
  summary,
  actions,
  showTrends,
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onClearCategories,
  categoriesPending,
}: TransactionSidebarProps) {
  return (
    <StickyRightSidebar>
      <div className="space-y-4">
        <Card>
          <h3 className="text-lg font-semibold">{summaryHeading}</h3>
          <div className="mt-4 space-y-3">
            {summary.map((item) => {
              const trend = item.trend ?? "flat";
              const TrendIcon = TREND_META[trend].icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4"
                >
                  <p className="text-muted-foreground text-sm">{item.label}</p>
                  <div className="flex items-center gap-2">
                    {showTrends && item.trend ? (
                      <TrendIcon
                        className={`size-4 ${TREND_META[trend].color}`}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="font-medium tabular-nums">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold">Quick Actions</h4>
          <div className="mt-4 space-y-2">
            {actions.map((action) => (
              <button
                key={action.id}
                className="hover:bg-accent w-full rounded p-2 text-left text-sm"
                type="button"
                onClick={action.callback}
              >
                <span className="block font-medium">{action.label}</span>
                {action.description ? (
                  <span className="text-muted-foreground text-xs">
                    {action.description}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-lg font-semibold">Filters</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={onClearCategories}
              disabled={selectedCategoryIds.length === 0}
            >
              Clear
            </Button>
          </div>

          <Separator className="mt-4" />

          <div className="mt-4">
            <CategoryFilterChips
              categories={categories}
              selectedIds={selectedCategoryIds}
              onToggle={onToggleCategory}
              pending={categoriesPending}
            />
          </div>
        </Card>
      </div>
    </StickyRightSidebar>
  );
}
