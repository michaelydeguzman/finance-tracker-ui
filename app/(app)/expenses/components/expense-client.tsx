"use client";

import { useMemo, useState, type ReactElement } from "react";
import { toast } from "sonner";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { ExpenseList } from "./expense-list";
import { ExpenseSidebar } from "./expense-sidebar";
import { AddTransactionDialog } from "@/app/transactions/components/add-transaction-dialog";
import { DeleteTransactionAlert } from "@/app/transactions/components/delete-transaction-alert";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";

import {
  buildExpenseEntries,
  buildExpenseQuickActions,
  buildExpenseSummary,
} from "../data/expense-data";
import { useExpenseTransactions } from "../hooks/use-expense-transactions";

export function ExpenseClient(): ReactElement {
  const {
    expenseTransactions,
    pending,
    addExpenseTransaction,
    updateExpenseTransaction,
    deleteExpenseTransaction,
  } = useExpenseTransactions();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const entries = useMemo(
    () => buildExpenseEntries(expenseTransactions),
    [expenseTransactions],
  );
  const summary = useMemo(
    () => buildExpenseSummary(expenseTransactions),
    [expenseTransactions],
  );
  const actions = useMemo(
    () =>
      buildExpenseQuickActions({
        "add-expense": () => setAddOpen(true),
        export: () => toast.info("Export flow has not been wired yet."),
      }),
    [],
  );

  const pendingDeleteName =
    expenseTransactions.find((t) => t.id === pendingDeleteId)?.name ??
    "this transaction";

  return (
    <PageWithSidebar
      sidebar={
        <ExpenseSidebar
          summary={summary}
          actions={actions}
          upcomingBills={[]}
        />
      }
    >
      <ExpenseList
        entries={entries}
        pending={pending}
        onEditEntry={(id) => {
          const t = expenseTransactions.find((x) => x.id === id);
          if (t) {
            setSelectedTransaction(t);
            setEditOpen(true);
          }
        }}
        onDeleteEntry={(id) => {
          setPendingDeleteId(id);
          setDeleteOpen(true);
        }}
      />
      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categoryType={CategoryType.Expense}
        onSubmit={addExpenseTransaction}
      />
      <AddTransactionDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next);
          if (!next) setSelectedTransaction(null);
        }}
        categoryType={CategoryType.Expense}
        transaction={selectedTransaction}
        onUpdate={(id, input) => {
          updateExpenseTransaction(id, input);
          setEditOpen(false);
          setSelectedTransaction(null);
        }}
      />
      <DeleteTransactionAlert
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          if (!next) setPendingDeleteId(null);
        }}
        transactionName={pendingDeleteName}
        onConfirm={() => {
          if (pendingDeleteId) deleteExpenseTransaction(pendingDeleteId);
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </PageWithSidebar>
  );
}
