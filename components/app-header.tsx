"use client";

import DarkModeTrigger from "./dark-mode-trigger";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <div className="w-full sticky top-0 h-14 flex justify-between  border-b-2 items-center pr-6 pl-4">
      <SidebarTrigger />
      <div className="flex items-center gap-3">
        <DarkModeTrigger />
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://avatars.githubusercontent.com/u/33743505?v=4" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>Hi, Michael</div>
        </div>
      </div>
    </div>
  );
}
