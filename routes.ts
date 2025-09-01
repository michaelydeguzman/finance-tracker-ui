import { Calendar, House, Inbox, Settings } from "lucide-react";
import Home from "./app/page";
import { Route } from "./types/app";

export const ROUTES = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    color: "",
  },
  {
    title: "Income",
    url: "/income",
    icon: Inbox,
    color: "",
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: Calendar,
    color: "",
  },
  {
    title: "Households",
    url: "/households",
    icon: House,
    color: "",
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Settings,
    color: "",
  },
] as Route[];
