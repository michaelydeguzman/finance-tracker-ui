/**
 * User-facing text for the sign-in flow.
 *
 * Separated from the page so it can become a translation catalog: when locales arrive,
 * this module is the seam an i18n library slots behind — the keys stay, the lookup gains a
 * locale, and no page changes. That is also why the fallback lives here rather than in the
 * page, since an unresolved key has to answer the same way in every language.
 */

/**
 * Keyed by the codes that reach the sign-in page: Auth.js error types on `?error=`, and
 * this app's own {@link AuthError} values from the session.
 */
export const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  AccessDenied:
    "That account is not authorized for this app. Ask the owner to add your email.",
  Configuration:
    "Sign-in is not configured correctly. Check the server credentials.",
  Verification: "That sign-in link has expired. Please try again.",
  OAuthAccountNotLinked:
    "That email is already linked to a different sign-in provider.",
  ExchangeFailed:
    "We could not complete sign-in. If you already have an account with this email, sign in with your password first.",
  RefreshFailed: "Your session expired. Please sign in again.",
  NoApiSession: "Your sign-in is no longer valid. Please sign in again.",
};

const AUTH_ERROR_FALLBACK = "Sign in failed. Please try again.";

/**
 * Message for an error code, or null when there is no error to report.
 *
 * Unknown codes fall back rather than surfacing the raw code: Auth.js can emit types this
 * app has never seen, and a bare "OAuthCallbackError" on screen tells a person nothing
 * they can act on.
 */
export function resolveAuthErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) {
    return null;
  }

  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_FALLBACK;
}
