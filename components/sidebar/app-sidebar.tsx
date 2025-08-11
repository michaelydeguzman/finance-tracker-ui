import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Briefcase,
  Calendar,
  CircleDollarSign,
  Cog,
  Home,
  House,
  Inbox,
  Search,
  Settings,
} from "lucide-react";

export function AppSidebar() {
  const mainPages = [
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
  ];

  const settings = [
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
  ];
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="flex gap-2 text-sm pl-2 pt-1 font-semibold items-center ">
            <CircleDollarSign /> My Finance Tracker
          </div>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainPages.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
