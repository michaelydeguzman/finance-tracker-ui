import { CircleDollarSign } from "lucide-react";
import DarkModeTrigger from "../dark-mode-trigger";
import { Separator } from "../ui/separator";
import HeaderNav from "./header-nav";
import UserHeader from "./user";

export default function Header() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex h-20 w-full items-center justify-between px-4 backdrop-blur md:px-[80px]">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <CircleDollarSign aria-hidden="true" />
          <span className="sr-only">Finance Tracker</span>
        </span>

        <HeaderNav />
      </div>

      <div className="flex items-center gap-3">
        <DarkModeTrigger />
        <Separator orientation="vertical" className="h-6" />
        <UserHeader />
      </div>
    </header>
  );
}
