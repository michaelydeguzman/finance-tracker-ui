"use client";

import { useMemo, useState, type ReactElement } from "react";
import { toast } from "sonner";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { ExpenseList } from "./expense-list";
import { ExpenseSidebar } from "./expense-sidebar";
import { AddTransactionDialog } from "@/app/transactions/components/add-transaction-dialog";
import { CategoryType } from "@/types/shared/enums";

import {
  buildExpenseEntries,
  buildExpenseQuickActions,
  buildExpenseSummary,
} from "../data/expense-data";
import { useExpenseTransactions } from "../hooks/use-expense-transactions";

export function ExpenseClient(): ReactElement {
  const { expenseTransactions, pending, addExpenseTransaction } =
    useExpenseTransactions();
  const [addOpen, setAddOpen] = useState(false);

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
      <ExpenseList entries={entries} pending={pending} />
      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categoryType={CategoryType.Expense}
        onSubmit={addExpenseTransaction}
      />
    </PageWithSidebar>
  );
}
