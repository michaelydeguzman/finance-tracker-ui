import PageTitle from "@/components/common/page-title";
import Dashboard from "@/components/dashboard/app-dashboard";

export default function Home() {
  return (
    <div className="m-6 flex flex-col gap-4">
      <PageTitle title="Finance Dashboard" subtitle="De Guzman Household" />
      <Dashboard />
    </div>
  );
}
