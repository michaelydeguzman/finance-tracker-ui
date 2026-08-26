import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import {
  type ApiSession,
  consumeMagicLink,
  exchangeExternalLogin,
  loginWithPassword,
  refreshApiSession,
} from "@/lib/server/api-session";

/**
 * Emails allowed to sign in, from `AUTH_ALLOWED_EMAILS` (comma separated).
 *
 * Meaningful only while `AUTH_SIGNUP_MODE` is `allowlist`. See {@link signupMode}.
 */
const allowedEmails = new Set(
  (process.env.AUTH_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== ""),
);

/**
 * Who may sign in.
 *
 * - `allowlist` (default) — only addresses in `AUTH_ALLOWED_EMAILS`, and an empty list
 *   admits nobody. This is what the app did when it held one household's finances.
 * - `open` — anyone who can authenticate gets their own tenant, which is the point of the
 *   multi-user work.
 *
 * Opening sign-up is an explicit choice rather than a side effect of clearing a variable:
 * silently turning a fail-closed gate into a fail-open one is exactly the kind of change
 * that should never happen by omission.
 */
export const signupMode: "open" | "allowlist" =
  process.env.AUTH_SIGNUP_MODE === "open" ? "open" : "allowlist";

export const hasAllowlist = allowedEmails.size > 0;

/** True when sign-in is possible at all — an allowlist-mode deployment with no entries is closed. */
export const signInIsAvailable = signupMode === "open" || hasAllowlist;

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (signupMode === "open") {
    return typeof email === "string" && email.trim() !== "";
  }

  return (
    typeof email === "string" && allowedEmails.has(email.trim().toLowerCase())
  );
};

/** Provider ids for the two credential flows, so callers never hand-type them. */
export const PASSWORD_PROVIDER = "password";
export const MAGIC_LINK_PROVIDER = "magic-link";

/**
 * Auth.js `user` shape returned by both credential flows: an id for Auth.js plus the API
 * session the BFF will use on this person's behalf.
 */
interface CredentialUser {
  id: string;
  email: string;
  apiSession: ApiSession;
}

const asCredentialUser = (session: ApiSession | null): CredentialUser | null =>
  session === null
    ? null
    : { id: session.userId, email: session.email, apiSession: session };

/** Google is always configured; extra providers switch on when their env vars exist. */
const providers: NextAuthConfig["providers"] = [
  Google({
    // Always prompt for account choice so a shared device can switch users.
    authorization: { params: { prompt: "select_account" } },
  }),
  Credentials({
    id: PASSWORD_PROVIDER,
    name: "Email and password",
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      const email =
        typeof credentials?.email === "string" ? credentials.email : "";
      const password =
        typeof credentials?.password === "string" ? credentials.password : "";

      if (!email || !password) return null;

      return asCredentialUser(await loginWithPassword(email, password));
    },
  }),
  Credentials({
    id: MAGIC_LINK_PROVIDER,
    name: "Email link",
    credentials: { token: {} },
    authorize: async (credentials) => {
      const token =
        typeof credentials?.token === "string" ? credentials.token : "";

      if (!token) return null;

      return asCredentialUser(await consumeMagicLink(token));
    },
  }),
];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub);
}

/** SSO providers the sign-in page should offer as buttons, derived from what is configured. */
export const enabledProviders: ReadonlyArray<{ id: string; name: string }> =
  providers
    .map((provider) => {
      const config = typeof provider === "function" ? provider() : provider;
      return { id: config.id, name: config.name };
    })
    .filter(
      (provider) =>
        provider.id !== PASSWORD_PROVIDER &&
        provider.id !== MAGIC_LINK_PROVIDER,
    );

/** Refresh this long before expiry, so a request never starts with a token about to die. */
const REFRESH_LEEWAY_MS = 60_000;

const isExpiring = (session: ApiSession): boolean =>
  Date.now() >= session.accessTokenExpiresAt - REFRESH_LEEWAY_MS;

export const authConfig = {
  providers,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn: ({ profile, account }) => {
      // Credential flows already proved themselves against the API, which enforces its own
      // rules; the allowlist gates SSO, where "has a Google account" is not authorization.
      if (
        account?.provider === PASSWORD_PROVIDER ||
        account?.provider === MAGIC_LINK_PROVIDER
      ) {
        return true;
      }

      return isEmailAllowed(profile?.email);
    },

    jwt: async ({ token, account, profile, user }) => {
      // 1. Credential sign-in: authorize() already holds the API session.
      const credentialUser = user as Partial<CredentialUser> | undefined;
      if (credentialUser?.apiSession) {
        token.apiSession = credentialUser.apiSession;
        token.email = credentialUser.apiSession.email;
        delete token.error;
        return token;
      }

      // 2. SSO sign-in: trade the provider's subject for an API session.
      if (account && profile?.email) {
        const provider = account.provider === "github" ? "GitHub" : "Google";
        const displayName =
          typeof profile.name === "string" ? profile.name : undefined;

        const apiSession = await exchangeExternalLogin({
          provider,
          providerSubject: account.providerAccountId,
          email: profile.email,
          // Google states this explicitly. The API refuses to attach an unverified address
          // to an account that already exists, so relaying it faithfully matters.
          emailVerified: profile.email_verified === true,
          displayName,
        });

        if (!apiSession) {
          token.error = "ExchangeFailed";
          delete token.apiSession;
          return token;
        }

        token.apiSession = apiSession;
        token.email = apiSession.email;
        delete token.error;
        return token;
      }

      // 3. Every later read: renew before the access token lapses.
      const existing = token.apiSession;

      if (!existing) {
        return token;
      }

      if (!isExpiring(existing)) {
        return token;
      }

      const refreshed = await refreshApiSession(existing.refreshToken);

      if (!refreshed) {
        // The old credentials are not reusable — the refresh token rotates on use, and a
        // failure may mean it was already spent. Drop them so nothing keeps trying.
        delete token.apiSession;
        token.error = "RefreshFailed";
        return token;
      }

      token.apiSession = refreshed;
      delete token.error;
      return token;
    },

    session: ({ session, token }) => {
      // The access and refresh tokens stay in the encrypted cookie. Putting them on the
      // session would hand them to the browser through /api/auth/session, and the API is
      // directly reachable — so that would turn any XSS into full API access.
      if (token.apiSession) {
        session.user.id = token.apiSession.userId;
        session.user.email = token.apiSession.email;
        session.user.emailConfirmed = token.apiSession.emailVerified;
      } else if (token.sub) {
        session.user.id = token.sub;
      }

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
