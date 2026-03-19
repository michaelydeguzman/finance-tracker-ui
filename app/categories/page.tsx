import PageTitle from "@/components/shared/page-title";
import ExpenseCategoryList from "./components/expense-categories";
import IncomeCategoryList from "./components/income-categories";

export default function Categories() {
  return (
    <>
      <PageTitle title="Categories" subtitle="De Guzman Household" />

      <div className="w-full flex justify-between gap-8">
        <IncomeCategoryList />
        <ExpenseCategoryList />
      </div>
    </>
  );
}
