import PageTitle from "@/components/shared/page-title";
import { TransactionPageClient } from "@/app/transactions/components/transaction-page-client";
import { CategoryType } from "@/types/shared/enums";

export const metadata = { title: "Expenses" };

export default function Expenses() {
  return (
    <>
      <PageTitle title="Expenses" />
      <TransactionPageClient categoryType={CategoryType.Expense} />
    </>
  );
}
