import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import {
  auth,
  enabledProviders,
  signIn,
  signInIsAvailable,
  signupMode,
} from "@/auth";
import { Separator } from "@/components/ui/separator";
import { isSafeCallbackUrl } from "@/lib/safe-callback-url";
import { AuthCard, AuthLink, AuthNotice } from "../components/auth-card";
import { CredentialsForm } from "../components/credentials-form";
import { ProviderSignInButton } from "../components/provider-sign-in-button";

export const metadata: Metadata = { title: "Sign in" };

/** NextAuth error codes mapped to something a person can act on. */
const ERROR_MESSAGES: Record<string, string> = {
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
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();

  // A session carrying an error is not usable — let them sign in again rather than
  // bouncing them to a dashboard that will fail every request.
  if (session?.user && !session.error) {
    redirect("/");
  }

  const { error, callbackUrl } = await searchParams;
  // Only same-origin paths, so `?callbackUrl=https://evil.example` cannot
  // turn the login page into an open redirect.
  const redirectTo =
    callbackUrl && isSafeCallbackUrl(callbackUrl) ? callbackUrl : "/";

  const message = error
    ? (ERROR_MESSAGES[error] ?? "Sign in failed. Please try again.")
    : null;

  if (!signInIsAvailable) {
    return (
      <AuthCard
        title="Finance Tracker"
        description="Sign-in is not available yet."
      >
        <AuthNotice tone="error">
          No authorized users are configured. Set{" "}
          <code className="font-mono text-xs">AUTH_ALLOWED_EMAILS</code>, or set{" "}
          <code className="font-mono text-xs">AUTH_SIGNUP_MODE=open</code> to
          allow anyone to register.
        </AuthNotice>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Finance Tracker"
      description="Sign in to access your finances."
      footer={
        <>
          {signupMode === "open" ? (
            <span>
              New here? <AuthLink href="/register">Create an account</AuthLink>
            </span>
          ) : null}
          <AuthLink href="/forgot-password">Forgot your password?</AuthLink>
        </>
      }
    >
      {message ? <AuthNotice tone="error">{message}</AuthNotice> : null}

      <CredentialsForm callbackUrl={redirectTo} />

      {enabledProviders.length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          {enabledProviders.map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server";
                try {
                  await signIn(provider.id, { redirectTo });
                } catch (reason) {
                  // `signIn` throws a redirect on success — only real auth
                  // failures should be turned into an error page.
                  if (reason instanceof AuthError) {
                    redirect(`/login?error=${reason.type}`);
                  }
                  throw reason;
                }
              }}
            >
              <ProviderSignInButton
                providerId={provider.id}
                providerName={provider.name}
              />
            </form>
          ))}
        </>
      ) : null}
    </AuthCard>
  );
}
