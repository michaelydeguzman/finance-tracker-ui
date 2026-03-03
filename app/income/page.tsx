import PageTitle from "@/components/shared/page-title";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { IncomeList } from "./_components/income-list";
import { IncomeSidebar } from "./_components/income-sidebar";
import {
  incomeEntries,
  incomeSummary,
  quickActions,
} from "./_data/income-data";

export default function Income() {
  return (
    <PageWithSidebar
      sidebar={<IncomeSidebar summary={incomeSummary} actions={quickActions} />}
    >
      <div className="space-y-6">
        <PageTitle title="Income" subtitle="De Guzman Household" />
        <IncomeList entries={incomeEntries} />
      </div>
    </PageWithSidebar>
  );
}
