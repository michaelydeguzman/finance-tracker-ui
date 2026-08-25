"use client";

import type { ComponentType } from "react";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { GoogleIcon } from "./provider-icons";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  google: GoogleIcon,
};

export function ProviderSignInButton({
  providerId,
  providerName,
}: {
  providerId: string;
  providerName: string;
}) {
  const { pending } = useFormStatus();
  const Icon = ICONS[providerId];

  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <Spinner className="size-4" />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      Continue with {providerName}
    </Button>
  );
}
