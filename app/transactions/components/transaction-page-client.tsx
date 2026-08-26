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
  filterTransactionsByCategories,
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
  createdBy,
}: {
  categoryType: CategoryType.Income | CategoryType.Expense;
  /**
   * Who the optimistic row should say added it. Display only — the backend stamps the real
   * value from the caller's token, so anything sent here would be ignored.
   */
  createdBy?: string;
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Filtering happens here rather than server-side: the page already holds every
  // transaction for this type, so toggling a chip stays instant and never
  // discards the optimistic list's in-flight add/edit/delete state.
  const visibleTransactions = useMemo(
    () => filterTransactionsByCategories(transactions, selectedCategoryIds),
    [transactions, selectedCategoryIds],
  );

  const entries = useMemo(
    () => buildTransactionEntries(visibleTransactions),
    [visibleTransactions],
  );
  const summary = useMemo(
    () => buildTransactionSummary(visibleTransactions),
    [visibleTransactions],
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

  const isFiltered = selectedCategoryIds.length > 0;

  const toggleCategory = (categoryId: string): void => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  return (
    <PageWithSidebar
      sidebar={
        <TransactionSidebar
          summary={summary}
          actions={actions}
          showTrends={view.showTrends}
          categories={categories}
          selectedCategoryIds={selectedCategoryIds}
          onToggleCategory={toggleCategory}
          onClearCategories={() => setSelectedCategoryIds([])}
          categoriesPending={categoriesPending}
        />
      }
    >
      <TransactionEntryList
        entries={entries}
        pending={pending}
        loadingText={view.loadingText}
        emptyText={
          isFiltered
            ? "No transactions in the selected categories."
            : view.emptyText
        }
        icon={view.icon}
        iconClassName={view.iconClassName}
        showDividers={view.showDividers}
        {...(view.amountPrefix ? { amountPrefix: view.amountPrefix } : {})}
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
          {...(createdBy ? { createdBy } : {})}
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
