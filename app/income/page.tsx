import PageTitle from "@/components/shared/page-title";
import { IncomeClient } from "./components/income-client";

export default function Income() {
  return (
    <div className="space-y-6">
      <PageTitle title="Income" subtitle="De Guzman Household" />
      <IncomeClient />
    </div>
  );
}
