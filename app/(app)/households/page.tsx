import PageTitle from "@/components/shared/page-title";
import HouseholdClient from "./components/household-client";

export const metadata = { title: "Households" };

export default function Households() {
  return (
    <>
      <PageTitle
        title="Households"
        subtitle="Share your finances with the people you live with"
      />

      <HouseholdClient />
    </>
  );
}
