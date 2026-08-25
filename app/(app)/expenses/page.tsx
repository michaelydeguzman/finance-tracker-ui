import PageTitle from "@/components/shared/page-title";
import { TransactionPageClient } from "@/app/transactions/components/transaction-page-client";
import { DEFAULT_HOUSEHOLD_NAME } from "@/constants";
import { CategoryType } from "@/types/shared/enums";

export const metadata = { title: "Expenses" };

export default function Expenses() {
  return (
    <>
      <PageTitle title="Expenses" subtitle={DEFAULT_HOUSEHOLD_NAME} />
      <TransactionPageClient categoryType={CategoryType.Expense} />
    </>
  );
}
