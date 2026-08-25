import PageTitle from "@/components/shared/page-title";
import Dashboard from "@/components/dashboard/dashboard";
import { DEFAULT_HOUSEHOLD_NAME } from "@/constants";

export default function Home() {
  return (
    <>
      <PageTitle title="Dashboard" subtitle={DEFAULT_HOUSEHOLD_NAME} />
      <Dashboard />
    </>
  );
}
