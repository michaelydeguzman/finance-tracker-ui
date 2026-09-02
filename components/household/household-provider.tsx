"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import {
  oneHouseholdBlockedReason,
  validateHouseholdName,
  validateInvitedEmail,
} from "@/lib/household";
import type { Household, HouseholdInvitation } from "@/types/household.api";

export interface UseHouseholdResult {
  household: Household | null;
  /** Open invitations addressed to the signed-in user. */
  invitations: HouseholdInvitation[];
  /** True while the first load is in flight, so the page never shows an empty state early. */
  loading: boolean;
  /** True while a mutation is in flight, so buttons can be disabled rather than double-fired. */
  pending: boolean;
  /**
   * Every mutation resolves to whether it actually worked.
   *
   * Errors are reported here as toasts rather than thrown, so a caller cannot learn the
   * outcome from the promise settling — and a form that clears its input on the strength
   * of that would throw away what the user typed every time the server said no.
   */
  create: (name: string) => Promise<boolean>;
  rename: (name: string) => Promise<boolean>;
  invite: (email: string) => Promise<boolean>;
  revoke: (invitationId: string) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
  leave: () => Promise<boolean>;
  accept: (invitationId: string) => Promise<boolean>;
  decline: (invitationId: string) => Promise<boolean>;
}

const errorMessage = (reason: unknown, fallback: string): string =>
  reason instanceof Error && reason.message ? reason.message : fallback;

const HouseholdContext = createContext<UseHouseholdResult | null>(null);

/**
 * All household state for the signed-in shell, in one place.
 *
 * Mounted in `app/(app)/layout.tsx` rather than on the households page, because the name
 * banner sits above every page's title and the households page rewrites the very state it
 * shows. Two independent fetches would let the banner keep naming a household the user has
 * just left.
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
export function HouseholdProvider({ children }: { children: React.ReactNode }) {
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
    ): Promise<boolean> => {
      setPending(true);

      try {
        await action();
        await load();
        toast.success(success);
        return true;
      } catch (reason) {
        console.error(fallbackError, reason);
        toast.error(errorMessage(reason, fallbackError));
        return false;
      } finally {
        setPending(false);
      }
    },
    [load],
  );

  const create = useCallback(
    async (name: string): Promise<boolean> => {
      // One household per person. The API answers 409, but `callBackend` replaces its
      // body with a generic conflict line, so a click that got that far would report
      // nothing the user could act on.
      const blocked = oneHouseholdBlockedReason(
        household?.name ?? null,
        "create",
      );

      if (blocked) {
        toast.error(blocked);
        return false;
      }

      const validated = validateHouseholdName(name);

      if (!validated.ok) {
        toast.error(validated.error);
        return false;
      }

      return run(
        () => createHousehold({ name: validated.value }),
        `"${validated.value}" is ready. Invite the people you share with.`,
        "Could not create the household.",
      );
    },
    [household, run],
  );

  const rename = useCallback(
    async (name: string): Promise<boolean> => {
      const validated = validateHouseholdName(name);

      if (!validated.ok) {
        toast.error(validated.error);
        return false;
      }

      return run(
        () => renameHousehold({ name: validated.value }),
        "Household renamed.",
        "Could not rename the household.",
      );
    },
    [run],
  );

  const invite = useCallback(
    async (email: string): Promise<boolean> => {
      const validated = validateInvitedEmail(email);

      if (!validated.ok) {
        toast.error(validated.error);
        return false;
      }

      return run(
        () => inviteHouseholdMember({ email: validated.value }),
        `Invitation sent to ${validated.value}.`,
        "Could not send the invitation.",
      );
    },
    [run],
  );

  const revoke = useCallback(
    async (invitationId: string): Promise<boolean> => {
      return run(
        () => revokeHouseholdInvitation(invitationId),
        "Invitation withdrawn.",
        "Could not withdraw the invitation.",
      );
    },
    [run],
  );

  const removeMember = useCallback(
    async (userId: string): Promise<boolean> => {
      return run(
        () => removeHouseholdMember(userId),
        "They no longer share this household.",
        "Could not remove them from the household.",
      );
    },
    [run],
  );

  const leave = useCallback(async (): Promise<boolean> => {
    return run(
      () => leaveHousehold(),
      "You have left the household. Your records are yours alone again.",
      "Could not leave the household.",
    );
  }, [run]);

  const accept = useCallback(
    async (invitationId: string): Promise<boolean> => {
      // The same rule from the other direction, and the reason the Accept button is
      // disabled rather than merely discouraged: accepting a second invitation cannot
      // succeed, and a record carries one household id, not two.
      const blocked = oneHouseholdBlockedReason(
        household?.name ?? null,
        "join",
      );

      if (blocked) {
        toast.error(blocked);
        return false;
      }

      return run(
        () => acceptInvitation(invitationId),
        "You are sharing finances with this household now.",
        "Could not accept the invitation.",
      );
    },
    [household, run],
  );

  const decline = useCallback(
    async (invitationId: string): Promise<boolean> => {
      return run(
        () => declineInvitation(invitationId),
        "Invitation declined.",
        "Could not decline the invitation.",
      );
    },
    [run],
  );

  const value = useMemo<UseHouseholdResult>(
    () => ({
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
    }),
    [
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
    ],
  );

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}

/**
 * The shell's household state.
 *
 * Throws outside the provider rather than returning a null-shaped default: a component
 * rendered outside the signed-in shell would otherwise report "no household" to someone who
 * has one, and the banner would quietly go missing instead of the mistake being visible.
 */
export function useHousehold(): UseHouseholdResult {
  const value = useContext(HouseholdContext);

  if (value === null) {
    throw new Error("useHousehold must be used inside a HouseholdProvider.");
  }

  return value;
}
