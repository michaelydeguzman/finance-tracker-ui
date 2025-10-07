import PageTitle from "@/components/common/page-title";
import Dashboard from "@/components/dashboard/dashboard";

export default function Home() {
  return (
    <>
      <PageTitle title="Dashboard" subtitle="De Guzman Household" />
      <Dashboard />
    </>
  );
}
