import type {
  CreateHouseholdRequest,
  Household,
  HouseholdInvitation,
  InviteMemberRequest,
} from "@/app/(app)/households/types/household.api";
import { apiFetch } from "@/lib/api/config";
import { HOUSEHOLD_ENDPOINTS } from "@/lib/api/endpoints";

const jsonRequest = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/**
 * The caller's household, or null when they are on their own.
 *
 * Null is the normal answer for most accounts, not an error — the API answers 200 with a
 * null body rather than a 404 so that no caller has to treat "you have no household" as a
 * failure.
 */
export const getMyHousehold = async (): Promise<Household | null> =>
  apiFetch<Household | null>(HOUSEHOLD_ENDPOINTS.mine);

export const createHousehold = async (
  payload: CreateHouseholdRequest,
): Promise<Household> =>
  apiFetch<Household>(HOUSEHOLD_ENDPOINTS.create, jsonRequest("POST", payload));

export const renameHousehold = async (
  payload: CreateHouseholdRequest,
): Promise<Household> =>
  apiFetch<Household>(HOUSEHOLD_ENDPOINTS.mine, jsonRequest("PUT", payload));

export const leaveHousehold = async (): Promise<void> =>
  apiFetch<void>(HOUSEHOLD_ENDPOINTS.leave, { method: "POST" });

export const removeHouseholdMember = async (
  userId: string,
): Promise<Household> =>
  apiFetch<Household>(HOUSEHOLD_ENDPOINTS.member(userId), { method: "DELETE" });

export const inviteHouseholdMember = async (
  payload: InviteMemberRequest,
): Promise<HouseholdInvitation> =>
  apiFetch<HouseholdInvitation>(
    HOUSEHOLD_ENDPOINTS.invitations,
    jsonRequest("POST", payload),
  );

export const revokeHouseholdInvitation = async (id: string): Promise<void> =>
  apiFetch<void>(HOUSEHOLD_ENDPOINTS.invitation(id), { method: "DELETE" });

/** Open invitations addressed to the signed-in user's own email address. */
export const getMyInvitations = async (): Promise<HouseholdInvitation[]> =>
  apiFetch<HouseholdInvitation[]>(HOUSEHOLD_ENDPOINTS.myInvitations);

export const acceptInvitation = async (id: string): Promise<Household> =>
  apiFetch<Household>(HOUSEHOLD_ENDPOINTS.acceptInvitation(id), {
    method: "POST",
  });

export const declineInvitation = async (id: string): Promise<void> =>
  apiFetch<void>(HOUSEHOLD_ENDPOINTS.declineInvitation(id), { method: "POST" });
