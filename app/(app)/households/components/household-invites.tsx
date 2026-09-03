"use client";

import { useState } from "react";
import { SendIcon, XIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { INVITED_EMAIL_MAX_LENGTH } from "@/lib/household";
import type { HouseholdInvitation } from "@/types/household.api";

interface HouseholdInvitesProps {
  invitations: HouseholdInvitation[];
  /** Resolves to whether the invitation was actually sent. */
  onInvite: (email: string) => Promise<boolean>;
  onRevoke: (invitationId: string) => void;
  pending: boolean;
}

/**
 * The owner's outgoing invitations.
 *
 * Only the owner ever renders this: the API populates `pendingInvitations` for them alone,
 * because the addresses a household has approached are not every member's business — one of
 * them may simply have said no.
 */
export default function HouseholdInvites({
  invitations,
  onInvite,
  onRevoke,
  pending,
}: HouseholdInvitesProps) {
  const [email, setEmail] = useState("");

  const submit = async (): Promise<void> => {
    // Same reason as the create form: a rejected address — already a member, already
    // invited, malformed — must still be on screen to correct.
    if (await onInvite(email)) {
      setEmail("");
    }
  };

  return (
    <Card>
      <div className="font-semibold">Invite someone</div>

      <form
        className="flex max-w-md flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={INVITED_EMAIL_MAX_LENGTH}
          placeholder="them@example.com"
          aria-label="Email address to invite"
          disabled={pending}
        />
        <Button type="submit" disabled={pending || email.trim().length === 0}>
          {pending ? <Spinner /> : <SendIcon aria-hidden="true" />}
          Send invitation
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        They decide whether to join. Nothing is shared until they accept.
      </p>

      {invitations.length > 0 ? (
        <ul className="flex flex-col pt-1">
          {invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="border-border flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
            >
              <span className="truncate text-sm">
                {invitation.invitedEmail}
                <span className="text-muted-foreground"> · awaiting reply</span>
              </span>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRevoke(invitation.id)}
                disabled={pending}
              >
                <XIcon aria-hidden="true" />
                <span className="sr-only">
                  Withdraw invitation to {invitation.invitedEmail}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
