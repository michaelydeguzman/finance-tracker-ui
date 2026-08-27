import type { DefaultSession } from "next-auth";
import type { ApiSession } from "@/lib/server/api-session";
import type { AuthError } from "@/lib/session-state";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /**
       * Whether the address has been confirmed. Named to avoid colliding with Auth.js's
       * own `emailVerified`, which its adapter types as a `Date`.
       */
      emailConfirmed?: boolean;
    } & DefaultSession["user"];

    /**
     * Present when the session cookie survives but the API credentials behind it did not.
     * The UI treats it as "sign in again" rather than showing a broken page.
     */
    error?: AuthError;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /**
     * The API credentials the BFF uses on this person's behalf. Deliberately absent from
     * `Session`: it lives in the encrypted cookie and is never serialized to the browser.
     */
    apiSession?: ApiSession;
    error?: AuthError;
  }
}
