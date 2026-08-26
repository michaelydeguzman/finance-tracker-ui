"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AuthNotice } from "./auth-card";

type Status = "pending" | "success" | "failed";

/**
 * Redeems a one-time token from a link the moment the page loads, and reports the outcome.
 *
 * Guarded against running twice: these tokens are single use, so a second call in React's
 * development double-invoke would consume the token and then report failure.
 */
export function TokenExchangeStatus({
  token,
  endpoint,
  pendingLabel,
  successLabel,
}: {
  token: string;
  endpoint: string;
  pendingLabel: string;
  successLabel: string;
}) {
  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const body = (await response.json()) as { error?: string };

        if (!response.ok) {
          setMessage(body.error ?? "That link is no longer valid.");
          setStatus("failed");
          return;
        }

        setStatus("success");
      } catch {
        setMessage("We could not reach the server. Please try again.");
        setStatus("failed");
      }
    };

    void run();
  }, [endpoint, token]);

  if (status === "pending") {
    return (
      <p
        className="text-muted-foreground flex items-center gap-2 text-sm"
        role="status"
      >
        <Spinner className="size-4" />
        {pendingLabel}
      </p>
    );
  }

  return status === "success" ? (
    <AuthNotice tone="success">{successLabel}</AuthNotice>
  ) : (
    <AuthNotice tone="error">{message}</AuthNotice>
  );
}
