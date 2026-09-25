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
    <div className={cn("flex w-full flex-col gap-6 lg:flex-row", className)}>
      {/* Main content area */}
      <div className="min-w-0 flex-1">{children}</div>

      {/* Sidebar area - only render if sidebar content is provided. Below `lg` it
          stacks above the content rather than disappearing: it holds the page's
          Add action and filters, not just decoration. */}
      {sidebar && (
        <div className="order-first shrink-0 lg:order-none">{sidebar}</div>
      )}
    </div>
  );
}
