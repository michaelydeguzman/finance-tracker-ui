/**
 * Why a session cannot be used, if it cannot.
 *
 * `ExchangeFailed` / `RefreshFailed` are set by the `jwt` callback when it could not
 * obtain or renew API credentials. `NoApiSession` covers the quieter case: a cookie that
 * predates this feature, or one whose credentials were dropped, carrying a user but no
 * way to call the API.
 */
export type AuthError = "ExchangeFailed" | "RefreshFailed" | "NoApiSession";

/**
 * Decides whether a session is usable, from the JWT behind it.
 *
 * Every gatekeeper has to agree on this. The middleware, the app shell and the sign-in
 * page each decide "is this person signed in?", while the BFF separately requires an
 * access token to proxy anything. When those disagree — a cookie with a user but no API
 * credentials — the result is an infinite redirect: the middleware and the sign-in page
 * both think you are signed in and send you to the dashboard, the dashboard's first fetch
 * 401s, and `apiFetch` bounces the browser back to sign-in.
 *
 * Returning an error here is what keeps that from happening: a session with no
 * credentials is reported as unusable everywhere, so the sign-in page shows the form
 * instead of redirecting.
 */
export function resolveSessionError(token: {
  error?: AuthError;
  hasApiSession: boolean;
}): AuthError | null {
  if (token.error) {
    return token.error;
  }

  return token.hasApiSession ? null : "NoApiSession";
}
