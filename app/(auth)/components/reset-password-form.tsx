"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthNotice } from "./auth-card";

const MINIMUM_PASSWORD_LENGTH = 12;

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmation) {
      toast.error("Those passwords do not match.");
      return;
    }

    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      toast.error(
        `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(body.error ?? "That reset link is no longer valid.");
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
        Your password has been changed, and any other sessions have been signed
        out. Sign in with your new password.
      </AuthNotice>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
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

      <div className="grid gap-2">
        <label htmlFor="confirmation" className="text-sm font-medium">
          Confirm new password
        </label>
        <Input
          id="confirmation"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? <Spinner className="size-4" /> : null}
        Change password
      </Button>
    </form>
  );
}
