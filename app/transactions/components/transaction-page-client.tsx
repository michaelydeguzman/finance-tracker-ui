"use client";

import { useMemo, useState, type ReactElement } from "react";
import { toast } from "sonner";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { useCategories } from "@/app/(app)/categories/hooks/use-categories";
import type { CategoryType } from "@/types/shared/enums";
import { TRANSACTION_VIEWS } from "../config/views";
import {
  buildQuickActions,
  buildTransactionEntries,
  buildTransactionSummary,
} from "../data/transaction-data";
import { useTransactions } from "../hooks/use-transactions";
import type { Transaction } from "../types/transaction.model";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { TransactionEntryList } from "./transaction-entry-list";
import { TransactionSidebar } from "./transaction-sidebar";

/**
 * Single implementation behind both `/income` and `/expenses`. Everything that
 * differs between them lives in `TRANSACTION_VIEWS`.
 */
export function TransactionPageClient({
  categoryType,
}: {
  categoryType: CategoryType.Income | CategoryType.Expense;
}): ReactElement {
  const view = TRANSACTION_VIEWS[categoryType];
  const {
    transactions,
    pending,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(categoryType);

  // Fetched once here rather than inside each dialog: the add and edit dialogs
  // are both mounted, so per-dialog fetching meant four requests per page load.
  const { categories, pending: categoriesPending } =
    useCategories(categoryType);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const entries = useMemo(
    () => buildTransactionEntries(transactions),
    [transactions],
  );
  const summary = useMemo(
    () => buildTransactionSummary(transactions),
    [transactions],
  );
  const actions = useMemo(
    () =>
      buildQuickActions(
        view.addLabel,
        view.addDescription,
        view.exportDescription,
        {
          onAdd: () => setAddOpen(true),
          onExport: () => toast.info("Export flow has not been wired yet."),
        },
      ),
    [view.addLabel, view.addDescription, view.exportDescription],
  );

  const pendingDeleteName =
    transactions.find((transaction) => transaction.id === pendingDeleteId)
      ?.name ?? "this transaction";

  return (
    <PageWithSidebar
      sidebar={
        <TransactionSidebar
          summaryHeading={view.summaryHeading}
          summary={summary}
          actions={actions}
          showTrends={view.showTrends}
          tipHeading={view.tipHeading}
          tip={view.tip}
        />
      }
    >
      <TransactionEntryList
        entries={entries}
        pending={pending}
        loadingText={view.loadingText}
        emptyText={view.emptyText}
        icon={view.icon}
        iconClassName={view.iconClassName}
        showDividers={view.showDividers}
        {...(view.amountPrefix ? { amountPrefix: view.amountPrefix } : {})}
        {...(view.amountClassName
          ? { amountClassName: view.amountClassName }
          : {})}
        onEditEntry={(id) => {
          const match = transactions.find(
            (transaction) => transaction.id === id,
          );
          if (match) {
            setSelectedTransaction(match);
            setEditOpen(true);
          }
        }}
        onDeleteEntry={(id) => {
          setPendingDeleteId(id);
          setDeleteOpen(true);
        }}
      />

      {/* Mounted only while open so each dialog seeds its form on mount. */}
      {addOpen ? (
        <AddTransactionDialog
          open
          onOpenChange={setAddOpen}
          categoryType={categoryType}
          categories={categories}
          categoriesPending={categoriesPending}
          onSubmit={addTransaction}
        />
      ) : null}

      {editOpen && selectedTransaction ? (
        <AddTransactionDialog
          mode="edit"
          open
          onOpenChange={(next) => {
            setEditOpen(next);
            if (!next) setSelectedTransaction(null);
          }}
          categoryType={categoryType}
          categories={categories}
          categoriesPending={categoriesPending}
          transaction={selectedTransaction}
          onUpdate={(id, input) => {
            updateTransaction(id, input);
            setEditOpen(false);
            setSelectedTransaction(null);
          }}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          if (!next) setPendingDeleteId(null);
        }}
        title="Delete transaction?"
        itemName={pendingDeleteName}
        onConfirm={() => {
          if (pendingDeleteId) deleteTransaction(pendingDeleteId);
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </PageWithSidebar>
  );
}
