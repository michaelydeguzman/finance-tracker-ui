import type { Metadata } from "next";
import { AuthCard, AuthLink } from "../components/auth-card";
import { EmailRequestForm } from "../components/email-request-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="We will email you a link to choose a new one."
      footer={<AuthLink href="/login">Back to sign in</AuthLink>}
    >
      <EmailRequestForm
        endpoint="/api/account/forgot-password"
        submitLabel="Email me a reset link"
      />
    </AuthCard>
  );
}
