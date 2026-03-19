"use client";

import { useMemo, useState, type ReactElement } from "react";
import { toast } from "sonner";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { IncomeList } from "./income-list";
import { IncomeSidebar } from "./income-sidebar";
import { useIncomeTransactions } from "../hooks/use-income-transactions";
import { AddTransactionDialog } from "@/app/transactions/components/add-transaction-dialog";
import { CategoryType } from "@/types/shared/enums";
import {
  buildIncomeEntries,
  buildIncomeQuickActions,
  buildIncomeSummary,
} from "../data/income-data";

export function IncomeClient(): ReactElement {
  const { incomeTransactions, pending, addIncomeTransaction } =
    useIncomeTransactions();
  const [addOpen, setAddOpen] = useState(false);

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

  return (
    <PageWithSidebar
      sidebar={<IncomeSidebar summary={summary} actions={actions} />}
    >
      <IncomeList entries={entries} pending={pending} />
      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categoryType={CategoryType.Income}
        onSubmit={addIncomeTransaction}
      />
    </PageWithSidebar>
  );
}
