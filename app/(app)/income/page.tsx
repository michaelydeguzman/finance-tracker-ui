import { auth } from "@/auth";
import PageTitle from "@/components/shared/page-title";
import { TransactionPageClient } from "@/app/transactions/components/transaction-page-client";
import { DEFAULT_HOUSEHOLD_NAME } from "@/constants";
import { CategoryType } from "@/types/shared/enums";

export const metadata = { title: "Income" };

export default async function Income() {
  const session = await auth();
  const createdBy = session?.user?.email ?? undefined;

  return (
    <>
      <PageTitle title="Income" subtitle={DEFAULT_HOUSEHOLD_NAME} />
      <TransactionPageClient
        categoryType={CategoryType.Income}
        {...(createdBy ? { createdBy } : {})}
      />
    </>
  );
}
