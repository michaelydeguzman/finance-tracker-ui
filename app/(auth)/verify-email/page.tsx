import type { Metadata } from "next";
import { AuthCard, AuthLink, AuthNotice } from "../components/auth-card";
import { VerifyEmailForm } from "../components/verify-email-form";

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
      description="Enter your password to confirm this address."
      footer={<AuthLink href="/login">Go to sign in</AuthLink>}
    >
      {token ? (
        <VerifyEmailForm token={token} />
      ) : (
        <AuthNotice tone="error">This link is missing its token.</AuthNotice>
      )}
    </AuthCard>
  );
}
