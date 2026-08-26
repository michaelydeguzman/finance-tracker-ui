import type { Metadata } from "next";
import { AuthCard, AuthLink, AuthNotice } from "../components/auth-card";
import { TokenExchangeStatus } from "../components/token-exchange-status";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard
      title="Confirm your email"
      description="One moment while we check this link."
      footer={<AuthLink href="/login">Go to sign in</AuthLink>}
    >
      {token ? (
        <TokenExchangeStatus
          token={token}
          endpoint="/api/account/verify-email"
          pendingLabel="Confirming your email address…"
          successLabel="Your email address is confirmed. You can sign in now."
        />
      ) : (
        <AuthNotice tone="error">This link is missing its token.</AuthNotice>
      )}
    </AuthCard>
  );
}
