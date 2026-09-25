import { CircleDollarSign } from "lucide-react";
import DarkModeTrigger from "../dark-mode-trigger";
import { Separator } from "../ui/separator";
import HeaderNav from "./header-nav";
import MobileNav from "./mobile-nav";
import UserHeader from "./user";

export default function Header() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex h-16 w-full items-center justify-between px-4 backdrop-blur md:px-8 lg:h-20 lg:px-[80px]">
      <div className="flex items-center gap-2 lg:gap-4">
        <MobileNav />

        <span className="flex items-center gap-2 text-sm font-semibold">
          <CircleDollarSign aria-hidden="true" />
          <span className="sr-only">Finance Tracker</span>
        </span>

        {/* Six links stop fitting beside the controls below `lg`; `MobileNav`
            takes over there. */}
        <div className="hidden lg:block">
          <HeaderNav />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DarkModeTrigger />
        <Separator orientation="vertical" className="h-6" />
        <UserHeader />
      </div>
    </header>
  );
}
