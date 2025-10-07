import PageTitle from "@/components/common/page-title";
import HouseholdList from "./_components/household-list";

export default function Households() {
  return (
    <>
      <PageTitle title="Households" subtitle="De Guzman Household" />
      <HouseholdList label="Households" />
    </>
  );
}
