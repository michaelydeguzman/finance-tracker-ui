"use client";

import { useMemo, type ReactElement } from "react";
import { toast } from "sonner";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { IncomeList } from "./income-list";
import { IncomeSidebar } from "./income-sidebar";
import { useIncomeTransactions } from "../_hooks/use-income-transactions";
import {
  buildIncomeEntries,
  buildIncomeQuickActions,
  buildIncomeSummary,
} from "../_data/income-data";

export function IncomeClient(): ReactElement {
  const { incomeTransactions, pending } = useIncomeTransactions();

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
        "add-income": () => toast.info("Income form has not been wired yet."),
        export: () => toast.info("Export flow has not been wired yet."),
      }),
    [],
  );

  return (
    <PageWithSidebar sidebar={<IncomeSidebar summary={summary} actions={actions} />}>
      <IncomeList entries={entries} pending={pending} />
    </PageWithSidebar>
  );
}
