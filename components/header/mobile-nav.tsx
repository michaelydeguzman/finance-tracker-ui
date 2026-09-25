"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, PlusIcon } from "lucide-react";
import { ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * The header's navigation below `lg`, where six inline links no longer fit
 * beside the theme toggle and user menu. `HeaderNav` takes over from `lg` up.
 */
export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Finance Tracker</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-2" aria-label="Main">
          {ROUTES.map((route) => {
            const isActive = route.url === pathname;
            const RouteIcon = route.icon;

            return (
              <Link
                key={route.url}
                href={route.url}
                aria-current={isActive ? "page" : undefined}
                // A client-side navigation keeps the sheet mounted, so it has
                // to be closed explicitly or it would cover the new page.
                onClick={() => setOpen(false)}
                className={cn(
                  "text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive && "bg-accent text-foreground",
                )}
              >
                <RouteIcon className="size-4" aria-hidden="true" />
                {route.title}
                {route.comingSoon ? (
                  <span
                    className="ml-auto inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-white"
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
      </SheetContent>
    </Sheet>
  );
}
