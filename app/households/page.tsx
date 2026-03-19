import PageTitle from "@/components/shared/page-title";
import HouseholdList from "./components/household-list";

export default function Households() {
  return (
    <>
      <PageTitle title="Households" subtitle="De Guzman Household" />
      <HouseholdList label="Households" />
    </>
  );
}
