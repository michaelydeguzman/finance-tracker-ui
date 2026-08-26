"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthNotice } from "./auth-card";

/**
 * Asks for an address and posts it to an endpoint that answers the same way whether or not
 * the account exists — so the confirmation is shown unconditionally.
 */
export function EmailRequestForm({
  endpoint,
  submitLabel,
}: {
  endpoint: string;
  submitLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setSent(true);
    } catch {
      toast.error("We could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthNotice tone="success">
        If that email address has an account, we have sent it a link. It expires
        shortly, so check soon.
      </AuthNotice>
    );
  }

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

      <Button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? <Spinner className="size-4" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
