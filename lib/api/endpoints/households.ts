/**
 * Client-facing household endpoint constants.
 *
 * Relative paths that hit the Next.js route handlers under `app/api/households/**`, which
 * proxy to the .NET backend. Split into what the caller does to *their* household and what
 * they do about invitations addressed to *them* — the two halves have different owners and
 * different permissions on the API side.
 */
export const HOUSEHOLD_ENDPOINTS = {
  /** POST – create a household. */
  create: "/api/households",

  /** GET / PUT – the caller's own household. */
  mine: "/api/households/me",

  /** POST – leave the household the caller is in. */
  leave: "/api/households/me/leave",

  /** DELETE – remove someone else from the household (owner only). */
  member: (userId: string) => `/api/households/me/members/${userId}` as const,

  /** POST – invite an address to the household (owner only). */
  invitations: "/api/households/me/invitations",

  /** DELETE – withdraw an invitation the household has issued (owner only). */
  invitation: (id: string) => `/api/households/me/invitations/${id}` as const,

  /** GET – open invitations addressed to the caller. */
  myInvitations: "/api/households/invitations",

  /** POST – answer an invitation addressed to the caller. */
  acceptInvitation: (id: string) =>
    `/api/households/invitations/${id}/accept` as const,

  /** POST – decline an invitation addressed to the caller. */
  declineInvitation: (id: string) =>
    `/api/households/invitations/${id}/decline` as const,
} as const;
