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

/**
 * One household per person, worded once.
 *
 * The API enforces the rule and answers 409, but `callBackend` replaces every backend body
 * with a generic line, so without these the browser shows "That change conflicts with an
 * existing record" for a situation that has an obvious explanation and an obvious fix.
 */
export const ONE_HOUSEHOLD_CONFLICT = {
  create: "You are already in a household. Leave it before creating another.",
  join: "You are already in a household. Leave it before joining another.",
} as const;

export type HouseholdIntent = keyof typeof ONE_HOUSEHOLD_CONFLICT;

/**
 * Why this person cannot create or join a household right now, or null when they can.
 *
 * A record carries a single household id, so someone in two households would have to
 * choose which one each new row belonged to — hence the rule. Checked in the browser as
 * well as by the API: the API is the authority, but a click that travels to the server only
 * to come back refused is a worse way to learn something the page already knows.
 *
 * Names the household when the caller knows it, because "you are already in a household" is
 * unhelpful to someone who has forgotten which.
 */
export function oneHouseholdBlockedReason(
  currentHouseholdName: string | null | undefined,
  intent: HouseholdIntent,
): string | null {
  if (currentHouseholdName === null || currentHouseholdName === undefined) {
    return null;
  }

  const name = currentHouseholdName.trim();

  if (name.length === 0) {
    return ONE_HOUSEHOLD_CONFLICT[intent];
  }

  return intent === "create"
    ? `You are already in "${name}". Leave it before creating another.`
    : `You are already in "${name}". Leave it before joining another.`;
}

/** "Michael" when there is a display name, the address otherwise. */
export function memberLabel(member: {
  displayName: string | null;
  email: string;
}): string {
  const name = member.displayName?.trim();
  return name && name.length > 0 ? name : member.email;
}
