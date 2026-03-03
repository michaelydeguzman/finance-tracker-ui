"use client";

import { useMemo, useState } from "react";
import { WalletIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import type { IncomeEntry } from "../_types/income.model";

interface IncomeListProps {
  entries: IncomeEntry[];
  pageSize?: number;
}

export function IncomeList({ entries, pageSize = 6 }: IncomeListProps) {
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
    return visibleEntries.reduce<Record<string, IncomeEntry[]>>(
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
          No income records yet. Start by logging your first entry.
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

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([key, dailyEntries]) => (
        <section key={key} className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {formatDateLabel(key)}
          </div>
          <div className="space-y-4">
            {dailyEntries.map((entry, index) => (
              <div key={entry.id} className="flex flex-col">
                <div className="p-4 rounded-lg flex items-center gap-4 hover:bg-gray-100 cursor-pointer">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <WalletIcon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{entry.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Category: {entry.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">
                      {entry.amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: entry.currency,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
                {index < dailyEntries.length - 1 && (
                  <div className="pt-4 border-b border-border" />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

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
