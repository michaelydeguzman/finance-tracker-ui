"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { AuthNotice } from "./auth-card";

/**
 * Redeems a magic link and establishes the session.
 *
 * Goes through Auth.js rather than a plain fetch: the API session it returns has to end up
 * in the encrypted session cookie, which only the sign-in flow can write.
 *
 * Guarded against running twice — the token is single use, so React's development
 * double-invoke would otherwise spend it and then report a failure.
 */
export function MagicLinkSignIn({ token }: { token: string }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const result = await signIn("magic-link", { token, redirect: false });

      if (result?.error) {
        setFailed(true);
        return;
      }

      router.push("/");
      router.refresh();
    };

    void run();
  }, [router, token]);

  return failed ? (
    <AuthNotice tone="error">
      That sign-in link has expired or has already been used. Request a new one
      from the sign-in page.
    </AuthNotice>
  ) : (
    <p
      className="text-muted-foreground flex items-center gap-2 text-sm"
      role="status"
    >
      <Spinner className="size-4" />
      Signing you in…
    </p>
  );
}
