"use client";

import { useMemo, useState, type ReactElement } from "react";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { useCategories } from "@/app/(app)/categories/hooks/use-categories";
import type { RecurringAction } from "@/lib/recurring-status";
import { CategoryType } from "@/types/shared/enums";
import { buildRecurringSummary } from "../data/recurring-data";
import { useRecurringOptions } from "../hooks/use-recurring-options";
import { useRecurringTransactions } from "../hooks/use-recurring-transactions";
import type { RecurringTransaction } from "../types/recurring.model";
import { RecurringDialog } from "./recurring-dialog";
import { RecurringList } from "./recurring-list";
import { RecurringSidebar, type StatusFilter } from "./recurring-sidebar";

/**
 * The `/recurring` screen: the templates the worker expands, and the actions
 * that decide whether it keeps expanding them.
 */
export function RecurringPageClient(): ReactElement {
  const {
    templates,
    pending,
    busyIds,
    addTemplate,
    editTemplate,
    runTransition,
    removeTemplate,
  } = useRecurringTransactions();

  // Both category types, because a template can generate either income or an
  // expense — the category is what decides which.
  const { categories: incomeCategories, pending: incomePending } =
    useCategories(CategoryType.Income);
  const { categories: expenseCategories, pending: expensePending } =
    useCategories(CategoryType.Expense);
  const { options: frequencies, pending: frequenciesPending } =
    useRecurringOptions();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RecurringTransaction | null>(
    null,
  );
  const [cancelTarget, setCancelTarget] = useState<RecurringTransaction | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // Filtered here rather than by refetching with `?status=`: the page already
  // holds every template, so switching filters stays instant and cannot drop
  // the result of an action that just came back.
  const visibleTemplates = useMemo(
    () =>
      statusFilter === "All"
        ? templates
        : templates.filter((template) => template.status === statusFilter),
    [templates, statusFilter],
  );

  // Summarizes everything, not just what is on screen — a filter narrows the
  // list, it does not change how many templates are active.
  const summary = useMemo(() => buildRecurringSummary(templates), [templates]);

  const handleAction = (
    template: RecurringTransaction,
    action: RecurringAction,
  ): void => {
    switch (action) {
      case "edit":
        setEditTarget(template);
        return;
      case "pause":
      case "resume":
        void runTransition(template.id, action);
        return;
      case "cancel":
        // Terminal, so it is confirmed rather than done on a single click.
        setCancelTarget(template);
        return;
      case "delete":
        setDeleteTarget(template);
        return;
    }
  };

  const categoriesPending = incomePending || expensePending;

  return (
    <PageWithSidebar
      sidebar={
        <RecurringSidebar
          summary={summary}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAdd={() => setAddOpen(true)}
        />
      }
    >
      <RecurringList
        templates={visibleTemplates}
        pending={pending}
        busyIds={busyIds}
        emptyText={
          statusFilter === "All"
            ? "Nothing repeats yet. Add a template and each transaction will be created for you when it falls due."
            : `No ${statusFilter.toLowerCase()} recurring transactions.`
        }
        onAction={handleAction}
      />

      {/* Mounted only while open so each dialog seeds its form on mount. */}
      {addOpen ? (
        <RecurringDialog
          open
          onOpenChange={setAddOpen}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          categoriesPending={categoriesPending}
          frequencies={frequencies}
          frequenciesPending={frequenciesPending}
          onSubmit={addTemplate}
        />
      ) : null}

      {editTarget ? (
        <RecurringDialog
          mode="edit"
          open
          onOpenChange={(next) => {
            if (!next) setEditTarget(null);
          }}
          template={editTarget}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          categoriesPending={categoriesPending}
          frequencies={frequencies}
          frequenciesPending={frequenciesPending}
          onSubmit={(input) => editTemplate(editTarget.id, input)}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={cancelTarget !== null}
        onOpenChange={(next) => {
          if (!next) setCancelTarget(null);
        }}
        title="Cancel this recurring transaction?"
        itemName={cancelTarget?.name ?? "this recurring transaction"}
        description={
          <>
            <span className="text-foreground font-medium">
              {cancelTarget?.name ?? "This template"}
            </span>{" "}
            will stop generating transactions. Cancelling is final — it cannot
            be resumed or edited afterwards — but the transactions it has
            already created keep their history.
          </>
        }
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep it running"
        onConfirm={() => {
          if (cancelTarget) void runTransition(cancelTarget.id, "cancel");
          setCancelTarget(null);
        }}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        title="Delete recurring transaction?"
        itemName={deleteTarget?.name ?? "this recurring transaction"}
        description={
          <>
            This will permanently remove{" "}
            <span className="text-foreground font-medium">
              {deleteTarget?.name ?? "this recurring transaction"}
            </span>
            . Only a template that has never generated a transaction can be
            deleted — if it has, cancel it instead.
          </>
        }
        onConfirm={() => {
          if (deleteTarget) void removeTemplate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </PageWithSidebar>
  );
}
