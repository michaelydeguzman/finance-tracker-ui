"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
              "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              isActive &&
                "text-foreground underline decoration-2 underline-offset-8",
            )}
          >
            {route.title}
          </Link>
        );
      })}
    </nav>
  );
}
