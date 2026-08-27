"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthLink } from "./auth-card";

/**
 * Email-and-password sign-in, plus the option to be emailed a link instead.
 *
 * Both paths report the same thing on failure. The API refuses to say whether an address
 * has an account, and inventing a distinction here would give away what it withholds.
 */
export function CredentialsForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [sendingLink, setSendingLink] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    startTransition(async () => {
      const result = await signIn("password", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email or password is incorrect.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  const handleEmailLink = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }

    setSendingLink(true);
    try {
      const response = await fetch("/api/account/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      toast.success(
        "If that email address has an account, we have sent it a link.",
      );
    } catch {
      toast.error("We could not send that link. Please try again.");
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <AuthLink
          href="/forgot-password"
          className="text-muted-foreground justify-self-start text-xs"
        >
          Forgot your password?
        </AuthLink>
      </div>

      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Sign in
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={handleEmailLink}
        disabled={sendingLink}
        aria-busy={sendingLink}
      >
        {sendingLink ? <Spinner className="size-4" /> : null}
        Email me a sign-in link instead
      </Button>
    </form>
  );
}
