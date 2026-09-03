"use client";

import { MailIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import type { HouseholdInvitation } from "@/types/household.api";

interface InvitationsCardProps {
  invitations: HouseholdInvitation[];
  /** True when the viewer is already in a household, so accepting cannot succeed yet. */
  alreadyInHousehold: boolean;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  pending: boolean;
}

/**
 * Invitations addressed to the signed-in user.
 *
 * Rendered only when there are some — an empty "no invitations" card would be noise on
 * every visit, for a thing that arrives a handful of times in an account's life.
 */
export default function InvitationsCard({
  invitations,
  alreadyInHousehold,
  onAccept,
  onDecline,
  pending,
}: InvitationsCardProps) {
  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-center gap-2 font-semibold">
        <MailIcon className="size-4" aria-hidden="true" />
        Invitations for you
      </div>

      <ul className="flex flex-col gap-3">
        {invitations.map((invitation) => (
          <li
            key={invitation.id}
            className="border-border flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col">
              <span className="font-medium">{invitation.householdName}</span>
              <span className="text-muted-foreground text-sm">
                Joining shares your income, expenses and categories with
                everyone in it.
              </span>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                onClick={() => onAccept(invitation.id)}
                disabled={pending || alreadyInHousehold}
                // The API refuses a second household, so the button says why rather
                // than letting the click come back as an error toast.
                title={
                  alreadyInHousehold
                    ? "Leave your current household first."
                    : undefined
                }
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => onDecline(invitation.id)}
                disabled={pending}
              >
                Decline
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {alreadyInHousehold ? (
        <p className="text-muted-foreground text-sm">
          You are already in a household. Leave it before joining another.
        </p>
      ) : null}
    </Card>
  );
}
