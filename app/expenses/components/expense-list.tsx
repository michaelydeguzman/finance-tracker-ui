"use client";

import { useMemo, useState } from "react";
import { ReceiptTextIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import type { ExpenseEntry } from "../types/expense.model";

interface ExpenseListProps {
  entries: ExpenseEntry[];
  pageSize?: number;
}

export function ExpenseList({ entries, pageSize = 6 }: ExpenseListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [entries],
  );

  const visibleEntries = useMemo(
    () => sortedEntries.slice(0, visibleCount),
    [sortedEntries, visibleCount],
  );

  const groupedEntries = useMemo(() => {
    return visibleEntries.reduce<Record<string, ExpenseEntry[]>>(
      (acc, entry) => {
        const key = new Date(entry.date).toDateString();
        acc[key] = acc[key] ? [...acc[key], entry] : [entry];
        return acc;
      },
      {},
    );
  }, [visibleEntries]);

  if (!entries.length) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          No expenses yet. Upload your first receipt to start tracking.
        </p>
      </Card>
    );
  }

  const formatDateLabel = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));

  const formatCurrency = (entry: ExpenseEntry) =>
    entry.amount.toLocaleString(undefined, {
      style: "currency",
      currency: entry.currency,
      maximumFractionDigits: 0,
    });

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([key, dailyEntries]) => {
        const dailyTotal = dailyEntries.reduce(
          (sum, current) => sum + current.amount,
          0,
        );
        const displayCurrency =
          dailyEntries.at(0)?.currency ?? entries.at(0)?.currency ?? "CAD";

        return (
          <section key={key} className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>{formatDateLabel(key)}</span>
              <span className="font-semibold text-foreground">
                {dailyTotal.toLocaleString(undefined, {
                  style: "currency",
                  currency: displayCurrency,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="space-y-4">
              {dailyEntries.map((entry, index) => (
                <div key={entry.id} className="flex flex-col">
                  <div className="p-4 rounded-lg flex items-center gap-4 hover:bg-muted/60 transition">
                    <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                      <ReceiptTextIcon className="size-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-medium">{entry.title}</h4>
                        <span className="font-semibold text-destructive">
                          -{formatCurrency(entry)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Category: {entry.category}</span>
                      </div>
                    </div>
                  </div>
                  {index < dailyEntries.length - 1 && (
                    <div className="pt-4 border-b border-border" />
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {visibleCount < sortedEntries.length && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
