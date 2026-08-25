import { InfoIcon } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { DEFAULT_HOUSEHOLD_NAME } from "@/constants";
import HouseholdList from "./components/household-list";

export const metadata = { title: "Households" };

export default function Households() {
  return (
    <>
      <PageTitle title="Households" subtitle={DEFAULT_HOUSEHOLD_NAME} />

      <p
        className="border-border text-muted-foreground flex items-start gap-2 rounded-md border border-dashed px-3 py-2 text-sm"
        role="status"
      >
        <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Households are not stored yet — the API has no household endpoint, so
          changes here are lost on refresh.
        </span>
      </p>

      <HouseholdList label="Households" />
    </>
  );
}
