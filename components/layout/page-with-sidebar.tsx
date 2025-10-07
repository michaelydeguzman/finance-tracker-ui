import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageWithSidebarProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export default function PageWithSidebar({
  children,
  sidebar,
  className,
}: PageWithSidebarProps) {
  return (
    <div className={cn("flex gap-8 w-full", className)}>
      {/* Main content area */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Sidebar area - only render if sidebar content is provided */}
      {sidebar && <div className="flex-shrink-0">{sidebar}</div>}
    </div>
  );
}
