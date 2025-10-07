import PageTitle from "@/components/common/page-title";
import Dashboard from "@/components/dashboard/dashboard";

export default function Home() {
  return (
    <>
      {/* subtitle should be dynamic and fetched from user context */}
      <PageTitle title="Dashboard" subtitle="De Guzman Household" />
      <Dashboard />
    </>
  );
}
