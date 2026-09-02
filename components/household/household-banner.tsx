"use client";

import Link from "next/link";
import { HouseIcon } from "lucide-react";
import { useHousehold } from "./household-provider";

/**
 * The household whose records the page below is showing.
 *
 * Sits above every page's title because the widened tenancy filter is invisible otherwise:
 * income, expenses and the dashboard simply return more rows once you are in a household,
 * with nothing on the page to say whose money is on screen.
 *
 * Renders nothing while the household is still loading, and nothing at all for someone on
 * their own — a banner that flashed in on every page load, or announced "no household" to
 * the majority of accounts, would be noise rather than orientation.
 */
export default function HouseholdBanner() {
  const { household, loading } = useHousehold();

  if (loading || household === null) {
    return null;
  }

  return (
    <Link
      href="/households"
      className="text-muted-foreground hover:text-foreground mb-2 inline-flex w-fit items-center gap-1.5 text-sm transition-colors"
    >
      <HouseIcon className="size-3.5" aria-hidden="true" />
      <span>
        Shared with <span className="font-medium">{household.name}</span>
      </span>
    </Link>
  );
}
