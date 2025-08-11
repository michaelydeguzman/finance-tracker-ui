import PageTitle from "@/components/common/page-title";
import ExpenseCategories from "@/components/templates/expense-categories/expense-categories";
import IncomeCategories from "@/components/templates/income-categories/income-categories";

export default function Categories() {
  return (
    <>
      <PageTitle title="Categories" subtitle="De Guzman Household" />

      <div className="w-full flex justify-between gap-8">
        <ExpenseCategories />
        <IncomeCategories />
      </div>
    </>
  );
}
