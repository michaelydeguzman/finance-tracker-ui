"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthNotice } from "./auth-card";

/**
 * Confirms an address with the emailed token plus the password chosen at sign-up.
 *
 * The link used to confirm on arrival. But the email goes to the address's owner whoever
 * registered it, so a click alone let an owner who never signed up vouch for a stranger's
 * password. Asking for the password binds the confirmation to whoever chose it.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!password) {
      toast.error("Enter the password you chose when you signed up.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/account/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(body.error ?? "That did not work. Please try again.");
        return;
      }

      setDone(true);
    } catch {
      toast.error("We could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthNotice tone="success">
        Your email address is confirmed. You can sign in now.
      </AuthNotice>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
        <p className="text-muted-foreground text-xs">
          The one you chose when you signed up. If you did not create an
          account, you can close this page — nothing happens without it.
        </p>
      </div>

      <Button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? <Spinner className="size-4" /> : null}
        Confirm email
      </Button>
    </form>
  );
}
