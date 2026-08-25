"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { ROUTES } from "@/routes";
import { cn } from "@/lib/utils";

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      {ROUTES.map((route) => {
        const isActive = route.url === pathname;

        return (
          <Link
            key={route.url}
            href={route.url}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              isActive &&
                "text-foreground underline decoration-2 underline-offset-8",
            )}
          >
            {route.title}
            {route.comingSoon ? (
              <span
                // `inline-flex` rather than `no-underline`: an ancestor's
                // text-decoration is drawn through inline children and cannot be
                // cancelled by them, but it skips atomic inline-level boxes.
                className="inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-white"
                title="Coming soon"
              >
                <PlusIcon className="size-3" aria-hidden="true" />
                <span className="sr-only">Coming soon</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
