"use client";

import DarkModeTrigger from "../dark-mode-trigger";
import { SidebarTrigger } from "../ui/sidebar";
import UserHeader from "./user";

export default function Header() {
  return (
    <div className="w-full sticky top-0 h-14 flex justify-between  border-b-2 items-center pr-6 pl-4">
      <SidebarTrigger />
      <div className="flex items-center gap-3">
        <DarkModeTrigger />
        <div className="flex items-center gap-2">
          <UserHeader />
        </div>
      </div>
    </div>
  );
}
