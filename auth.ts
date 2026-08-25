import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * Emails allowed to sign in, from `AUTH_ALLOWED_EMAILS` (comma separated).
 *
 * This app holds one household's finances, so "has a Google account" is not a
 * sufficient authorization check — SSO proves *who* you are, not that you
 * belong here. With no allowlist configured we fail closed rather than open.
 */
const allowedEmails = new Set(
  (process.env.AUTH_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== ""),
);

export const hasAllowlist = allowedEmails.size > 0;

export const isEmailAllowed = (email: string | null | undefined): boolean =>
  typeof email === "string" && allowedEmails.has(email.trim().toLowerCase());

/** Google is always configured; extra providers switch on when their env vars exist. */
const providers: NextAuthConfig["providers"] = [
  Google({
    // Always prompt for account choice so a shared device can switch users.
    authorization: { params: { prompt: "select_account" } },
  }),
];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub);
}

/** Providers the sign-in page should offer, derived from what is configured. */
export const enabledProviders: ReadonlyArray<{ id: string; name: string }> =
  providers.map((provider) => {
    const config = typeof provider === "function" ? provider() : provider;
    return { id: config.id, name: config.name };
  });

export const authConfig = {
  providers,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn: ({ profile }) => isEmailAllowed(profile?.email),
    jwt: ({ token, profile }) => {
      if (profile?.email) {
        token.email = profile.email;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
