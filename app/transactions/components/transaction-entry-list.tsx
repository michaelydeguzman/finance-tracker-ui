"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { TransactionEntry } from "../types/transaction.model";

export interface TransactionEntryListProps {
  entries: TransactionEntry[];
  pageSize?: number;
  pending?: boolean;
  loadingText: string;
  emptyText: string;
  icon: ReactNode;
  iconClassName: string;
  amountClassName?: string;
  amountPrefix?: string;
  showDividers?: boolean;
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

export function TransactionEntryList({
  entries,
  pageSize = 6,
  pending = false,
  loadingText,
  emptyText,
  icon,
  iconClassName,
  amountClassName,
  amountPrefix,
  showDividers = true,
  onEditEntry,
  onDeleteEntry,
}: TransactionEntryListProps) {
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
    return visibleEntries.reduce<Record<string, TransactionEntry[]>>(
      (acc, entry) => {
        const key = new Date(entry.date).toDateString();
        acc[key] = acc[key] ? [...acc[key], entry] : [entry];
        return acc;
      },
      {},
    );
  }, [visibleEntries]);

  if (pending && !entries.length) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="text-muted-foreground" />
          <span>{loadingText}</span>
        </div>
      </Card>
    );
  }

  if (!entries.length) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">{emptyText}</p>
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
          <div className="text-[17px] font-semibold text-muted-foreground">
            {formatDateLabel(key)}
          </div>
          <div className="space-y-4">
            {dailyEntries.map((entry, index) => (
              <div key={entry.id} className="flex flex-col">
                <div
                  className={cn(
                    "group p-4 rounded-lg flex items-center gap-4 cursor-default",
                    "bg-muted/60 hover:bg-muted/90",
                  )}
                >
                  <div
                    className={cn("rounded-full p-3 shrink-0", iconClassName)}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium">{entry.category}</h4>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {entry.title}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1 transition-opacity duration-150",
                        "opacity-0 [@media(hover:none)]:opacity-100",
                        "group-hover:opacity-100 group-focus-within:opacity-100",
                      )}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label="Edit transaction"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEntry?.(entry.id);
                        }}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label="Delete transaction"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEntry?.(entry.id);
                        }}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                    <span
                      className={cn(
                        "font-semibold text-right tabular-nums",
                        amountClassName,
                      )}
                    >
                      {amountPrefix}
                      {entry.amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: entry.currency,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
                {showDividers && index < dailyEntries.length - 1 && (
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
