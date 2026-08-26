import type { Metadata } from "next";
import { AuthCard, AuthLink, AuthNotice } from "../components/auth-card";
import { MagicLinkSignIn } from "../components/magic-link-sign-in";

export const metadata: Metadata = { title: "Signing you in" };

export default async function MagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard
      title="Signing you in"
      description="One moment while we check your link."
      footer={<AuthLink href="/login">Back to sign in</AuthLink>}
    >
      {token ? (
        <MagicLinkSignIn token={token} />
      ) : (
        <AuthNotice tone="error">
          This link is missing its token. Request a new one from the sign-in
          page.
        </AuthNotice>
      )}
    </AuthCard>
  );
}
