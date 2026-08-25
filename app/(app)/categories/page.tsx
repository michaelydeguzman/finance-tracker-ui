import PageTitle from "@/components/shared/page-title";
import { CategoryType } from "@/types/shared/enums";
import CategorySection from "./components/category-section";

export const metadata = { title: "Categories" };

export default function Categories() {
  return (
    <>
      <PageTitle title="Categories" />

      <div className="flex w-full flex-col justify-between gap-8 lg:flex-row">
        <CategorySection
          categoryType={CategoryType.Income}
          label="Income Categories"
        />
        <CategorySection
          categoryType={CategoryType.Expense}
          label="Expense Categories"
        />
      </div>
    </>
  );
}
