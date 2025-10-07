"use client";

import { CircleDollarSign } from "lucide-react";
import DarkModeTrigger from "../dark-mode-trigger";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import UserHeader from "./user";
import { ROUTES } from "@/routes";
import { MouseEvent } from "react";
import { Route } from "@/types/app";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathName = usePathname();

  const handleNavClick = (route: Route) => {
    router.push(route.url);
  };

  const activePage = router;

  return (
    <div className="w-full sticky top-0 h-20 flex justify-between items-center bg-white z-10 px-[80px]">
      {/* <SidebarTrigger /> */}
      <div className="flex gap-4 items-center">
        {/* Logo */}
        <div className="flex gap-2 text-sm font-semibold items-center ">
          <CircleDollarSign />
        </div>

        {/* Navigation */}
        <div className="flex gap-2 items-center">
          {ROUTES.map((item) => {
            return (
              <Button
                key={item.title}
                variant="ghost"
                className="text-md text-gray-600 flex flex-col py-4 "
                onClick={() => handleNavClick(item)}
              >
                <span
                  className={`font-semibold ${
                    item.url === pathName
                      ? "underline underline-offset-8 decoration-2 "
                      : ""
                  } }`}
                >
                  {item.title}
                </span>
              </Button>
            );
          })}
          {/* <Button variant="ghost" className="text-md text-gray-600">
            Home
          </Button>
          <Button variant="ghost" className="text-md">
            Income
          </Button>
          <Button variant="ghost" className="text-md">
            Expenses
          </Button>
          <Button variant="ghost" className="text-md">
            Configuration
          </Button> */}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DarkModeTrigger />
        <Separator orientation="vertical" />
        <div className="flex items-center gap-2">
          <UserHeader />
        </div>
      </div>
    </div>
  );
}
