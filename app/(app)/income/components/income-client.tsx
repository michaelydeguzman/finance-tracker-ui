"use client";

import { useMemo, useState, type ReactElement } from "react";
import { toast } from "sonner";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { IncomeList } from "./income-list";
import { IncomeSidebar } from "./income-sidebar";
import { useIncomeTransactions } from "../hooks/use-income-transactions";
import { AddTransactionDialog } from "@/app/transactions/components/add-transaction-dialog";
import { DeleteTransactionAlert } from "@/app/transactions/components/delete-transaction-alert";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";
import {
  buildIncomeEntries,
  buildIncomeQuickActions,
  buildIncomeSummary,
} from "../data/income-data";

export function IncomeClient(): ReactElement {
  const {
    incomeTransactions,
    pending,
    addIncomeTransaction,
    updateIncomeTransaction,
    deleteIncomeTransaction,
  } = useIncomeTransactions();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const entries = useMemo(
    () => buildIncomeEntries(incomeTransactions),
    [incomeTransactions],
  );
  const summary = useMemo(
    () => buildIncomeSummary(incomeTransactions),
    [incomeTransactions],
  );
  const actions = useMemo(
    () =>
      buildIncomeQuickActions({
        "add-income": () => setAddOpen(true),
        export: () => toast.info("Export flow has not been wired yet."),
      }),
    [],
  );

  const pendingDeleteName =
    incomeTransactions.find((t) => t.id === pendingDeleteId)?.name ??
    "this transaction";

  return (
    <PageWithSidebar
      sidebar={<IncomeSidebar summary={summary} actions={actions} />}
    >
      <IncomeList
        entries={entries}
        pending={pending}
        onEditEntry={(id) => {
          const t = incomeTransactions.find((x) => x.id === id);
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
        categoryType={CategoryType.Income}
        onSubmit={addIncomeTransaction}
      />
      <AddTransactionDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next);
          if (!next) setSelectedTransaction(null);
        }}
        categoryType={CategoryType.Income}
        transaction={selectedTransaction}
        onUpdate={(id, input) => {
          updateIncomeTransaction(id, input);
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
          if (pendingDeleteId) deleteIncomeTransaction(pendingDeleteId);
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </PageWithSidebar>
  );
}
