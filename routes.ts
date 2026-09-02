import {
  Calendar,
  House,
  Inbox,
  LayoutDashboard,
  Repeat,
  Settings,
} from "lucide-react";
import type { Route } from "./types/app";

export const ROUTES: readonly Route[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Income",
    url: "/income",
    icon: Inbox,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: Calendar,
  },
  {
    title: "Recurring",
    url: "/recurring",
    icon: Repeat,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Settings,
  },
  {
    title: "Households",
    url: "/households",
    icon: House,
  },
];
