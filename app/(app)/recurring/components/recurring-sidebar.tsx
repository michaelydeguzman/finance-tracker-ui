"use client";

import { PlusIcon } from "lucide-react";
import Card from "@/components/shared/card";
import StickyRightSidebar from "@/components/layout/sticky-right-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  RECURRING_STATUSES,
  type RecurringStatus,
} from "@/lib/recurring-status";
import type { RecurringSummaryItem } from "../data/recurring-data";

/** `"All"` is the page's default: no filter, everything shown. */
export type StatusFilter = RecurringStatus | "All";

export const STATUS_FILTERS: readonly StatusFilter[] = [
  "All",
  ...RECURRING_STATUSES,
];

interface RecurringSidebarProps {
  summary: RecurringSummaryItem[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onAdd: () => void;
}

export function RecurringSidebar({
  summary,
  statusFilter,
  onStatusFilterChange,
  onAdd,
}: RecurringSidebarProps) {
  return (
    <StickyRightSidebar>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onAdd}
          title="Set up a transaction that repeats on a schedule"
          className="bg-card hover:bg-accent flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-4 shadow-sm transition-colors"
        >
          <PlusIcon className="size-5" aria-hidden="true" />
          <span className="text-center text-sm font-semibold">
            New recurring transaction
          </span>
        </button>

        <Card>
          <h3 className="text-lg font-semibold">Summary</h3>

          <Separator />

          <div className="space-y-3">
            {summary.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4"
              >
                <p className="text-muted-foreground text-sm">{item.label}</p>
                <span className="truncate text-right font-medium tabular-nums">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bare, like the transactions page's quick filters. */}
        <div className="space-y-3 px-1 pt-1">
          <h4 className="text-sm font-semibold">Show</h4>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isSelected = filter === statusFilter;

              return (
                <Button
                  key={filter}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={isSelected}
                  onClick={() => onStatusFilterChange(filter)}
                  className={cn(
                    "h-8 rounded-full px-4 text-xs font-semibold shadow-sm",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "bg-card text-foreground hover:bg-accent",
                  )}
                >
                  {filter}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </StickyRightSidebar>
  );
}
