"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ChevronDownIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { TransactionEntry } from "../types/transaction.model";

/** One read-only label/value line inside an expanded row. */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactNode {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0 font-medium">
        {label}
      </span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export interface TransactionEntryListProps {
  entries: TransactionEntry[];
  pageSize?: number;
  pending?: boolean;
  loadingText: string;
  emptyText: string;
  icon: ReactNode;
  iconClassName: string;
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
  amountPrefix,
  showDividers = true,
  onEditEntry,
  onDeleteEntry,
}: TransactionEntryListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  // A set rather than a single id: rows stay open independently so two entries
  // can be compared side by side.
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleExpanded = (id: string): void => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

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
    <div className="space-y-5">
      {Object.entries(groupedEntries).map(([key, dailyEntries]) => (
        <section key={key} className="space-y-2">
          <div className="text-[17px] font-semibold text-muted-foreground">
            {formatDateLabel(key)}
          </div>
          <div className="space-y-2">
            {dailyEntries.map((entry, index) => {
              const isExpanded = expandedIds.has(entry.id);

              return (
              <div key={entry.id} className="flex flex-col">
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-controls={`entry-details-${entry.id}`}
                  onClick={() => toggleExpanded(entry.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpanded(entry.id);
                    }
                  }}
                  className={cn(
                    "group p-3 flex items-center gap-3 cursor-pointer",
                    "bg-muted transition-colors hover:bg-muted/70",
                    isExpanded ? "rounded-t-xl" : "rounded-xl",
                  )}
                >
                  <div
                    className={cn("rounded-full p-2.5 shrink-0", iconClassName)}
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
                    <span className="font-semibold text-right tabular-nums whitespace-nowrap">
                      {amountPrefix}
                      {formatCurrency(entry.amount)}
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "text-muted-foreground size-4 shrink-0 transition-transform",
                        isExpanded && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {isExpanded ? (
                  <div
                    id={`entry-details-${entry.id}`}
                    className="bg-muted/60 space-y-2 rounded-b-xl px-3 pt-1 pb-3"
                  >
                    <DetailRow label="Category" value={entry.category} />
                    <DetailRow
                      label="Date"
                      value={formatDateLabel(entry.date)}
                    />
                    {entry.description ? (
                      <DetailRow
                        label="Description"
                        value={entry.description}
                      />
                    ) : null}
                    {entry.frequencyName ? (
                      <DetailRow
                        label="Recurrence"
                        value={entry.frequencyName}
                      />
                    ) : null}
                    {entry.createdBy ? (
                      <DetailRow label="Added by" value={entry.createdBy} />
                    ) : null}
                    <DetailRow
                      label="Added on"
                      value={formatDateLabel(entry.createdAt)}
                    />

                    <div className="border-border mt-3 border-t pt-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold">Amount</span>
                        <span className="font-semibold tabular-nums whitespace-nowrap">
                          {amountPrefix}
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {showDividers && index < dailyEntries.length - 1 && (
                  <div className="pt-4 border-b border-border" />
                )}
              </div>
              );
            })}
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
