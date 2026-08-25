import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, enabledProviders, hasAllowlist, signIn } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
};

const isSafeCallbackUrl = (value: string): boolean =>
  value.startsWith("/") && !value.startsWith("//");

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();

  if (session?.user) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Tracker</CardTitle>
        <CardDescription>
          Sign in with your account to access your household finances.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {message ? (
          <p
            className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        {hasAllowlist ? (
          enabledProviders.map((provider) => (
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
          ))
        ) : (
          <p
            className="text-muted-foreground border-border rounded-md border border-dashed px-3 py-4 text-sm"
            role="alert"
          >
            No authorized users are configured. Set{" "}
            <code className="font-mono text-xs">AUTH_ALLOWED_EMAILS</code> in
            the server environment before signing in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
