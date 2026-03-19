"use client";

import { useMemo, type ReactElement } from "react";
import { toast } from "sonner";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { ExpenseList } from "./expense-list";
import { ExpenseSidebar } from "./expense-sidebar";

import {
  buildExpenseEntries,
  buildExpenseQuickActions,
  buildExpenseSummary,
} from "../data/expense-data";
import { useExpenseTransactions } from "../hooks/use-expense-transactions";

export function ExpenseClient(): ReactElement {
  const { expenseTransactions, pending } = useExpenseTransactions();

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
        "add-expense": () => toast.info("Expense form has not been wired yet."),
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
    </PageWithSidebar>
  );
}
