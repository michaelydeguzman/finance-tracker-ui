"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Route-group error boundary. Replaces the unused `AsyncBoundary` component:
 * Next's own convention actually gets mounted, so failures inside a page show
 * this instead of an unstyled crash.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled UI error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-1">
        <h2 className="text-destructive text-lg font-semibold">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm">
          This page failed to load. Your data has not been changed.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>

      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
