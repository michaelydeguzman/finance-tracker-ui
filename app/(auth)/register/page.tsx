import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth, signupMode } from "@/auth";
import { AuthCard, AuthLink } from "../components/auth-card";
import { RegisterForm } from "../components/register-form";

export const metadata: Metadata = { title: "Create an account" };

/**
 * Rendered per request, never prerendered.
 *
 * `notFound()` below short-circuits before the session is read, so a build with sign-up
 * closed would otherwise bake a 404 into a static page — and the route would keep serving
 * it after `AUTH_SIGNUP_MODE` was switched to `open` in the running environment.
 */
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  // Registration only exists when sign-up is open. In allowlist mode the page is not a
  // disabled form, it simply is not there.
  if (signupMode !== "open") {
    notFound();
  }

  const session = await auth();
  if (session?.user && !session.error) {
    redirect("/");
  }

  return (
    <AuthCard
      title="Create an account"
      description="Track your income and expenses in one place."
      footer={
        <span>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </span>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
