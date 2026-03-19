import PageTitle from "@/components/shared/page-title";
import { ExpenseClient } from "./components/expense-client";

export default function Expenses() {
  return (
    <>
      <PageTitle title="Expenses" subtitle="De Guzman Household" />
      <ExpenseClient />
    </>
  );
}
