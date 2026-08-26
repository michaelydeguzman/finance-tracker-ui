import type { Metadata } from "next";
import { AuthCard, AuthLink, AuthNotice } from "../components/auth-card";
import { ResetPasswordForm } from "../components/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard
      title="Choose a new password"
      description="This also signs you out everywhere else."
      footer={<AuthLink href="/login">Back to sign in</AuthLink>}
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <AuthNotice tone="error">
          This link is missing its token. Request a new one from the sign-in
          page.
        </AuthNotice>
      )}
    </AuthCard>
  );
}
