"use client";

import { useState } from "react";
import { UserMinusIcon, UsersIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { memberLabel } from "@/lib/household";
import type { Household, HouseholdMember } from "../types/household.api";

interface HouseholdMembersProps {
  household: Household;
  onRemove: (userId: string) => void;
  pending: boolean;
}

/** Who is in the household, and — for the owner — how to take someone out of it. */
export default function HouseholdMembers({
  household,
  onRemove,
  pending,
}: HouseholdMembersProps) {
  const [removing, setRemoving] = useState<HouseholdMember | null>(null);

  return (
    <Card>
      <div className="flex items-center gap-2 font-semibold">
        <UsersIcon className="size-4" aria-hidden="true" />
        Members
      </div>

      <ul className="flex flex-col">
        {household.members.map((member) => (
          <li
            key={member.userId}
            className="border-border flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">
                {memberLabel(member)}
                {member.isYou ? (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    (you)
                  </span>
                ) : null}
              </span>
              <span className="text-muted-foreground truncate text-sm">
                {member.email}
                {member.isOwner ? " · owner" : null}
              </span>
            </div>

            {/* Removing yourself is leaving, which the household card owns. */}
            {household.isOwner && !member.isYou ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRemoving(member)}
                disabled={pending}
              >
                <UserMinusIcon aria-hidden="true" />
                <span className="sr-only">Remove {memberLabel(member)}</span>
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <ConfirmDeleteDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        title="Remove from household?"
        itemName={removing ? memberLabel(removing) : ""}
        confirmLabel="Remove"
        description={
          <>
            <span className="text-foreground font-medium">
              {removing ? memberLabel(removing) : ""}
            </span>{" "}
            will no longer see this household&apos;s finances, and their own
            records stop being visible here. Nothing is deleted.
          </>
        }
        onConfirm={() => {
          if (removing) onRemove(removing.userId);
          setRemoving(null);
        }}
      />
    </Card>
  );
}
