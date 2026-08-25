import PageTitle from "@/components/shared/page-title";
import { TransactionPageClient } from "@/app/transactions/components/transaction-page-client";
import { CategoryType } from "@/types/shared/enums";

export const metadata = { title: "Income" };

export default function Income() {
  return (
    <>
      <PageTitle title="Income" />
      <TransactionPageClient categoryType={CategoryType.Income} />
    </>
  );
}
