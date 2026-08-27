"use client";

import {
  CalendarClockIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  RepeatIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { SortButton } from "@/components/shared/sort-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useSortableData } from "@/hooks/use-sortable-data";
import { formatCurrency } from "@/lib/currency";
import {
  availableActions,
  type RecurringAction,
  type RecurringStatus,
} from "@/lib/recurring-status";
import { cn } from "@/lib/utils";
import { CategoryType } from "@/types/shared/enums";
import { isDue, nextOccurrenceLabel } from "../data/recurring-schedule";
import type { RecurringTransaction } from "../types/recurring.model";

/** Module-level so the sort memo's dependency stays referentially stable. */
const templateName = (template: RecurringTransaction): string => template.name;

const STATUS_STYLES: Record<RecurringStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-600",
  Paused: "bg-amber-500/10 text-amber-600",
  Cancelled: "bg-muted text-muted-foreground",
};

const ACTION_META: Record<
  RecurringAction,
  { label: string; icon: LucideIcon; destructive?: boolean }
> = {
  edit: { label: "Edit", icon: PencilIcon },
  pause: { label: "Pause", icon: PauseIcon },
  resume: { label: "Resume", icon: PlayIcon },
  cancel: { label: "Cancel schedule", icon: XCircleIcon, destructive: true },
  delete: { label: "Delete", icon: Trash2Icon, destructive: true },
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export interface RecurringListProps {
  templates: RecurringTransaction[];
  pending: boolean;
  busyIds: ReadonlySet<string>;
  /** Copy for the empty state — differs when a status filter is applied. */
  emptyText: string;
  onAdd: () => void;
  onAction: (template: RecurringTransaction, action: RecurringAction) => void;
}

export function RecurringList({
  templates,
  pending,
  busyIds,
  emptyText,
  onAdd,
  onAction,
}: RecurringListProps) {
  // Unsorted is the API's own "soonest due first", which is the ordering that
  // answers the question this page exists for. The button cycles A→Z→unsorted.
  const { sortedData, sort, toggleSort } = useSortableData(
    templates,
    templateName,
  );

  return (
    <Card>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="ml-[-16px]">
          <SortButton
            label="Name"
            sort={sort}
            onToggle={toggleSort}
            className="text-md"
          />
        </div>

        <Button variant="secondary" onClick={onAdd} disabled={pending}>
          <PlusIcon />
          Add
        </Button>
      </div>

      {/* Never an empty state while the first fetch is still running. */}
      {pending ? (
        <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
          <Spinner className="text-muted-foreground" />
          <span>Loading recurring transactions…</span>
        </div>
      ) : sortedData.length === 0 ? (
        <p className="text-muted-foreground py-6 text-sm">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sortedData.map((template) => {
            const busy = busyIds.has(template.id);
            const actions = availableActions(template.status);
            const due = isDue(template.status, template.nextOccurrenceDate);
            const isIncome = template.categoryType === CategoryType.Income;

            return (
              <li
                key={template.id}
                className="bg-muted flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center"
              >
                <div
                  className={cn(
                    "hidden size-10 shrink-0 items-center justify-center rounded-full sm:flex",
                    isIncome
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  <RepeatIcon className="size-5" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium">{template.name}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        STATUS_STYLES[template.status],
                      )}
                    >
                      {template.status}
                    </span>
                  </div>

                  <div className="text-muted-foreground mt-1 text-sm">
                    {template.categoryName} · {template.frequencyName}
                    {template.endDate
                      ? ` · ends ${dateFormatter.format(template.endDate)}`
                      : ""}
                  </div>

                  {/* The single most useful line on the screen: when the next
                      transaction actually appears. */}
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-1.5 text-sm",
                      due
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    <CalendarClockIcon className="size-4" aria-hidden="true" />
                    <span>
                      {nextOccurrenceLabel(
                        template.status,
                        template.nextOccurrenceDate,
                      )}
                      {template.status === "Active"
                        ? ` · ${dateFormatter.format(template.nextOccurrenceDate)}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                  <span className="font-semibold tabular-nums whitespace-nowrap">
                    {isIncome ? "+ " : "− "}
                    {formatCurrency(template.amount)}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={busy}
                        aria-label={`Actions for ${template.name}`}
                      >
                        {busy ? (
                          <Spinner className="text-muted-foreground" />
                        ) : (
                          <MoreHorizontalIcon className="size-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Built from the status table, so nothing the API is
                          certain to refuse is ever offered. */}
                      {actions.map((action) => {
                        const meta = ACTION_META[action];
                        const ActionIcon = meta.icon;

                        return (
                          <DropdownMenuItem
                            key={action}
                            variant={
                              meta.destructive ? "destructive" : "default"
                            }
                            onSelect={() => onAction(template, action)}
                          >
                            <ActionIcon className="size-4" aria-hidden="true" />
                            {meta.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
