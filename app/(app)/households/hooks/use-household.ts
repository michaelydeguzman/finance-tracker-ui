"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  acceptInvitation,
  createHousehold,
  declineInvitation,
  getMyHousehold,
  getMyInvitations,
  inviteHouseholdMember,
  leaveHousehold,
  removeHouseholdMember,
  renameHousehold,
  revokeHouseholdInvitation,
} from "@/lib/api/households";
import { validateHouseholdName, validateInvitedEmail } from "@/lib/household";
import type { Household, HouseholdInvitation } from "../types/household.api";

export interface UseHouseholdResult {
  household: Household | null;
  /** Open invitations addressed to the signed-in user. */
  invitations: HouseholdInvitation[];
  /** True while the first load is in flight, so the page never shows an empty state early. */
  loading: boolean;
  /** True while a mutation is in flight, so buttons can be disabled rather than double-fired. */
  pending: boolean;
  create: (name: string) => Promise<void>;
  rename: (name: string) => Promise<void>;
  invite: (email: string) => Promise<void>;
  revoke: (invitationId: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  leave: () => Promise<void>;
  accept: (invitationId: string) => Promise<void>;
  decline: (invitationId: string) => Promise<void>;
}

const errorMessage = (reason: unknown, fallback: string): string =>
  reason instanceof Error && reason.message ? reason.message : fallback;

/**
 * All household state for the page, in one hook.
 *
 * Deliberately not `useOptimisticList`: every action here changes who can see the
 * household's money, and showing a member as removed before the server agrees would be a
 * lie about access rather than a cosmetic reorder. Each mutation therefore refetches and
 * renders what the server actually says.
 *
 * The household and the invitation list are loaded together because they answer the same
 * question — "where do I stand?" — and a page that has one but not the other can only
 * render a half-answer.
 */
export function useHousehold(): UseHouseholdResult {
  const [household, setHousehold] = useState<Household | null>(null);
  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  /**
   * @param isStillWanted Guards the writes, so a load still in flight when the page
   * unmounts resolves into nothing rather than setting state on a gone component.
   */
  const load = useCallback(
    async (isStillWanted: () => boolean = () => true): Promise<void> => {
      const [mine, mail] = await Promise.all([
        getMyHousehold(),
        getMyInvitations(),
      ]);

      if (!isStillWanted()) return;

      setHousehold(mine);
      setInvitations(mail);
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    // Deferred out of the effect body, the way `useCategories` defers its own first
    // fetch: a load called straight from here reads as a synchronous setState, which
    // is a cascading render (and the lint rule that says so).
    void Promise.resolve()
      .then(() => load(() => isActive))
      .catch((reason: unknown) => {
        console.error("Failed to load household:", reason);
        if (isActive) {
          // Without this a failed load is indistinguishable from "you are not in a
          // household", and the page invites you to create a second one.
          toast.error("Could not load your household.");
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [load]);

  /**
   * Runs one mutation, then reloads. The reload is inside the same guard so a second click
   * cannot land between the write and the refetch and act on stale membership.
   */
  const run = useCallback(
    async (
      action: () => Promise<unknown>,
      success: string,
      fallbackError: string,
    ): Promise<void> => {
      setPending(true);

      try {
        await action();
        await load();
        toast.success(success);
      } catch (reason) {
        console.error(fallbackError, reason);
        toast.error(errorMessage(reason, fallbackError));
      } finally {
        setPending(false);
      }
    },
    [load],
  );

  const create = useCallback(
    async (name: string): Promise<void> => {
      const validated = validateHouseholdName(name);

      if (!validated.ok) {
        toast.error(validated.error);
        return;
      }

      await run(
        () => createHousehold({ name: validated.value }),
        `"${validated.value}" is ready. Invite the people you share with.`,
        "Could not create the household.",
      );
    },
    [run],
  );

  const rename = useCallback(
    async (name: string): Promise<void> => {
      const validated = validateHouseholdName(name);

      if (!validated.ok) {
        toast.error(validated.error);
        return;
      }

      await run(
        () => renameHousehold({ name: validated.value }),
        "Household renamed.",
        "Could not rename the household.",
      );
    },
    [run],
  );

  const invite = useCallback(
    async (email: string): Promise<void> => {
      const validated = validateInvitedEmail(email);

      if (!validated.ok) {
        toast.error(validated.error);
        return;
      }

      await run(
        () => inviteHouseholdMember({ email: validated.value }),
        `Invitation sent to ${validated.value}.`,
        "Could not send the invitation.",
      );
    },
    [run],
  );

  const revoke = useCallback(
    async (invitationId: string): Promise<void> => {
      await run(
        () => revokeHouseholdInvitation(invitationId),
        "Invitation withdrawn.",
        "Could not withdraw the invitation.",
      );
    },
    [run],
  );

  const removeMember = useCallback(
    async (userId: string): Promise<void> => {
      await run(
        () => removeHouseholdMember(userId),
        "They no longer share this household.",
        "Could not remove them from the household.",
      );
    },
    [run],
  );

  const leave = useCallback(async (): Promise<void> => {
    await run(
      () => leaveHousehold(),
      "You have left the household. Your records are yours alone again.",
      "Could not leave the household.",
    );
  }, [run]);

  const accept = useCallback(
    async (invitationId: string): Promise<void> => {
      await run(
        () => acceptInvitation(invitationId),
        "You are sharing finances with this household now.",
        "Could not accept the invitation.",
      );
    },
    [run],
  );

  const decline = useCallback(
    async (invitationId: string): Promise<void> => {
      await run(
        () => declineInvitation(invitationId),
        "Invitation declined.",
        "Could not decline the invitation.",
      );
    },
    [run],
  );

  return {
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
  };
}
