import PageTitle from "@/components/shared/page-title";
import { RecurringPageClient } from "./components/recurring-page-client";

export const metadata = { title: "Recurring" };

export default function Recurring() {
  return (
    <>
      <PageTitle
        title="Recurring"
        subtitle="Transactions that create themselves on a schedule"
      />
      <RecurringPageClient />
    </>
  );
}
