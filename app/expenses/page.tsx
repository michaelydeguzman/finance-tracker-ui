import PageTitle from "@/components/shared/page-title";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { ExpenseList } from "./_components/expense-list";
import { ExpenseSidebar } from "./_components/expense-sidebar";
import {
  expenseEntries,
  expenseQuickActions,
  expenseSummary,
  upcomingBills,
} from "./_data/expense-data";

export default function Expenses() {
  return (
    <PageWithSidebar
      sidebar={
        <ExpenseSidebar
          summary={expenseSummary}
          actions={expenseQuickActions}
          upcomingBills={upcomingBills}
        />
      }
    >
      <div className="space-y-6">
        <PageTitle title="Expenses" subtitle="De Guzman Household" />
        <ExpenseList entries={expenseEntries} />
      </div>
    </PageWithSidebar>
  );
}
