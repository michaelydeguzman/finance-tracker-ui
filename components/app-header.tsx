"use client";

import DarkModeTrigger from "./dark-mode-trigger";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <div className="w-full sticky top-0 h-14 flex justify-between  border-b-2 items-center px-3">
      <SidebarTrigger />
      <DarkModeTrigger />
    </div>
  );
}
