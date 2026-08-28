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
import { resolveAuthErrorMessage } from "@/lib/messages/auth";
import { isSafeCallbackUrl } from "@/lib/safe-callback-url";
import { AuthCard, AuthLink, AuthNotice } from "../components/auth-card";
import { CredentialsForm } from "../components/credentials-form";
import { ProviderSignInButton } from "../components/provider-sign-in-button";

export const metadata: Metadata = { title: "Sign in" };

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

  // A session that survived but lost its API credentials arrives here with no ?error=,
  // because the middleware redirected rather than the sign-in flow failing. Falling back
  // to the session's own reason means the page explains itself instead of showing a bare
  // form to someone who thought they were already signed in.
  const message = resolveAuthErrorMessage(error ?? session?.error);

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
        signupMode === "open" ? (
          <span>
            New here? <AuthLink href="/register">Create an account</AuthLink>
          </span>
        ) : null
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
