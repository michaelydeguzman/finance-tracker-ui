import PageTitle from "@/components/shared/page-title";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { ExpenseList } from "./components/expense-list";
import { ExpenseSidebar } from "./components/expense-sidebar";
import {
  expenseEntries,
  expenseQuickActions,
  expenseSummary,
  upcomingBills,
} from "./data/expense-data";

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
