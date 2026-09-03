import PageTitle from "@/components/shared/page-title";
import HouseholdClient from "./components/household-client";

export const metadata = { title: "Household" };

export default function Households() {
  return (
    <>
      <PageTitle
        title="Household"
        subtitle="Share your finances with the people you live with"
      />

      <HouseholdClient />
    </>
  );
}
