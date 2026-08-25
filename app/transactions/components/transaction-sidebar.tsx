"use client";

import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  DownloadIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StickyRightSidebar from "@/components/layout/sticky-right-sidebar";
import type { Category } from "@/app/(app)/categories/types/category.model";
import type {
  QuickActionIcon,
  QuickActionItem,
  TransactionSummaryItem,
} from "../types/transaction.model";
import { CategoryFilterChips } from "./category-filter-chips";

const TREND_META = {
  up: { icon: ArrowUpRightIcon, color: "text-emerald-600" },
  down: { icon: ArrowDownRightIcon, color: "text-rose-600" },
  flat: { icon: MinusIcon, color: "text-muted-foreground" },
} as const;

/** Exhaustive by construction — a new `QuickActionIcon` won't compile without one. */
const ACTION_ICONS: Record<QuickActionIcon, LucideIcon> = {
  add: PlusIcon,
  export: DownloadIcon,
};

interface TransactionSidebarProps {
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
      <div className="space-y-3">
        {/* Deliberately not wrapped in `Card` — these read as bare tiles rather
            than a titled section. */}
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const ActionIcon = ACTION_ICONS[action.icon];

            return (
              <button
                key={action.id}
                type="button"
                onClick={action.callback}
                // The longer copy becomes the hover tooltip rather than being
                // dropped — the tile itself stays icon-plus-label.
                {...(action.description ? { title: action.description } : {})}
                className="bg-card hover:bg-accent flex flex-col items-center justify-center gap-2 rounded-2xl p-4 shadow-sm transition-colors"
              >
                <ActionIcon className="size-5" aria-hidden="true" />
                <span className="text-center text-sm font-semibold">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>

        <Card>
          <h3 className="text-lg font-semibold">Summary</h3>

          <Separator />

          <div className="space-y-3">
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

        {/* Bare like the action tiles — deliberately not wrapped in `Card`. */}
        <div className="space-y-3 px-1 pt-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold">Quick filters</h4>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="bg-card text-foreground hover:bg-accent h-8 rounded-full px-5 text-xs font-semibold shadow-sm"
              onClick={onClearCategories}
              disabled={selectedCategoryIds.length === 0}
            >
              Clear
            </Button>
          </div>

          <CategoryFilterChips
            categories={categories}
            selectedIds={selectedCategoryIds}
            onToggle={onToggleCategory}
            pending={categoriesPending}
          />
        </div>
      </div>
    </StickyRightSidebar>
  );
}
