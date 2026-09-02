"use client";

import { useHousehold } from "@/components/household/household-provider";
import Card from "@/components/shared/card";
import { Spinner } from "@/components/ui/spinner";
import CreateHouseholdCard from "./create-household-card";
import HouseholdCard from "./household-card";
import HouseholdInvites from "./household-invites";
import HouseholdMembers from "./household-members";
import InvitationsCard from "./invitations-card";

/**
 * The whole households page below the title.
 *
 * One client boundary rather than several: every card here reads the same household and
 * every action rewrites it, so splitting the state across sibling boundaries would only
 * mean fetching it more than once and letting the copies disagree.
 */
export default function HouseholdClient() {
  const {
    household,
    invitations,
    loading,
    pending,
    create,
    rename,
    invite,
    revoke,
    removeMember,
    leave,
    accept,
    decline,
  } = useHousehold();

  // Never an empty state while the fetch is in flight — "start a household" shown to
  // someone who already has one is worse than a moment of nothing.
  if (loading) {
    return (
      <Card>
        <div className="text-muted-foreground flex items-center gap-2 py-10">
          <Spinner />
          Loading your household…
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <InvitationsCard
        invitations={invitations}
        alreadyInHousehold={household !== null}
        onAccept={(id) => void accept(id)}
        onDecline={(id) => void decline(id)}
        pending={pending}
      />

      {household === null ? (
        <CreateHouseholdCard onCreate={create} pending={pending} />
      ) : (
        <>
          <HouseholdCard
            household={household}
            onRename={rename}
            onLeave={() => void leave()}
            pending={pending}
          />

          <div className="flex w-full flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <HouseholdMembers
                household={household}
                onRemove={(userId) => void removeMember(userId)}
                pending={pending}
              />
            </div>

            {household.isOwner ? (
              <div className="flex-1">
                <HouseholdInvites
                  invitations={household.pendingInvitations}
                  onInvite={invite}
                  onRevoke={(id) => void revoke(id)}
                  pending={pending}
                />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
