"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthNotice } from "./auth-card";

const MINIMUM_PASSWORD_LENGTH = 12;

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      toast.error(
        `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
        }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(body.error ?? "We could not create that account.");
        return;
      }

      // Shown whether or not the address was already taken — the API answers the same way
      // either way, and telling them apart here would defeat that.
      setSent(true);
      router.refresh();
    } catch {
      toast.error("We could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthNotice tone="success">
        Check <strong>{email.trim()}</strong> for a link to confirm your
        address. You can close this page.
      </AuthNotice>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          Name{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          id="displayName"
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </div>

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
          autoComplete="new-password"
          minLength={MINIMUM_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <p className="text-muted-foreground text-xs">
          At least {MINIMUM_PASSWORD_LENGTH} characters.
        </p>
      </div>

      <Button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? <Spinner className="size-4" /> : null}
        Create account
      </Button>
    </form>
  );
}
