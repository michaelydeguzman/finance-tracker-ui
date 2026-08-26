import { HouseIcon } from "lucide-react";
import Card from "@/components/shared/card";
import PageTitle from "@/components/shared/page-title";

export const metadata = { title: "Households" };

export default function Households() {
  return (
    <>
      <PageTitle title="Households" />

      {/* The list UI exists in ./components/household-list, but the API has no
          household endpoint yet, so anything entered is lost on refresh. It
          stays unrendered until there is somewhere to persist it. */}
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <HouseIcon className="size-6" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Sharing your finances with other people in your household isn&apos;t
            ready yet. Your income, expenses and categories all keep working as
            usual in the meantime.
          </p>
        </div>
      </Card>
    </>
  );
}
