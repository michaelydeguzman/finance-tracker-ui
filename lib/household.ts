/**
 * Pure household rules, shared by the browser forms and the BFF route handlers.
 *
 * Both sides validate, and they must agree: a name the form accepts and the route rejects
 * is a submit button that silently does nothing. Keeping the rules here — with no `fetch`,
 * no React and no `server-only` import — is also what lets them be unit-tested.
 */

/** Matches `MaxLength(100)` on the API's household name. */
export const HOUSEHOLD_NAME_MAX_LENGTH = 100;

/** Matches `MaxLength(320)` on the API's invited email. */
export const INVITED_EMAIL_MAX_LENGTH = 320;

export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/**
 * Trims and length-checks a household name.
 *
 * Trimming first, and rejecting what is left: "   " is not a name, and storing it would
 * produce a household whose card renders as an empty heading.
 */
export function validateHouseholdName(name: unknown): Validated<string> {
  if (typeof name !== "string") {
    return { ok: false, error: "A household name is required." };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: "A household name is required." };
  }

  if (trimmed.length > HOUSEHOLD_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `A household name can be at most ${HOUSEHOLD_NAME_MAX_LENGTH} characters.`,
    };
  }

  return { ok: true, value: trimmed };
}

/**
 * Trims, lowercases and shape-checks an invited address.
 *
 * The same shallow check the API applies — exactly one `@`, with something either side —
 * rather than a fuller pattern. An address is proved by whether the invitation reaches
 * someone signed in as it, so a stricter regex here would only reject valid addresses.
 *
 * Lowercased because the API normalizes before matching against the account's own address,
 * and an invitation stored under a different casing would never be found by its recipient.
 */
export function validateInvitedEmail(email: unknown): Validated<string> {
  if (typeof email !== "string") {
    return { ok: false, error: "A valid email address is required." };
  }

  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");

  const looksLikeAnEmail =
    at > 0 && at < trimmed.length - 1 && trimmed.indexOf("@", at + 1) < 0;

  if (!looksLikeAnEmail) {
    return { ok: false, error: "A valid email address is required." };
  }

  if (trimmed.length > INVITED_EMAIL_MAX_LENGTH) {
    return {
      ok: false,
      error: `An email address can be at most ${INVITED_EMAIL_MAX_LENGTH} characters.`,
    };
  }

  return { ok: true, value: trimmed };
}

/** "Michael" when there is a display name, the address otherwise. */
export function memberLabel(member: {
  displayName: string | null;
  email: string;
}): string {
  const name = member.displayName?.trim();
  return name && name.length > 0 ? name : member.email;
}
