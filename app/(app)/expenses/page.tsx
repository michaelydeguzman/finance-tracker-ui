import { auth } from "@/auth";
import PageTitle from "@/components/shared/page-title";
import { TransactionPageClient } from "@/app/transactions/components/transaction-page-client";
import { CategoryType } from "@/types/shared/enums";

export const metadata = { title: "Expenses" };

export default async function Expenses() {
  const session = await auth();
  const createdBy = session?.user?.email ?? undefined;

  return (
    <>
      <PageTitle title="Expenses" />
      <TransactionPageClient
        categoryType={CategoryType.Expense}
        {...(createdBy ? { createdBy } : {})}
      />
    </>
  );
}
