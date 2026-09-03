/** Shapes returned by the .NET households endpoints, unwrapped from the API envelope. */

export type HouseholdInvitationStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Revoked";

export interface HouseholdMember {
  userId: string;
  email: string;
  displayName: string | null;
  isOwner: boolean;
  /** The signed-in viewer, decided server-side so the browser needs no id to compare. */
  isYou: boolean;
}

export interface HouseholdInvitation {
  id: string;
  householdId: string;
  householdName: string;
  invitedEmail: string;
  status: HouseholdInvitationStatus;
  createdAt: string;
  expiresAt: string;
}

export interface Household {
  id: string;
  name: string;
  ownerUserId: string;
  /** Whether the viewer may rename, invite, remove members, or close the household. */
  isOwner: boolean;
  createdAt: string;
  members: HouseholdMember[];
  /** Only ever populated for the owner; empty for everyone else. */
  pendingInvitations: HouseholdInvitation[];
}

export interface CreateHouseholdRequest {
  name: string;
}

export interface InviteMemberRequest {
  email: string;
}
