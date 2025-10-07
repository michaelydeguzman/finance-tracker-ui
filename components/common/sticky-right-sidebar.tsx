import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyRightSidebarProps {
  children: ReactNode;
  className?: string;
  width?: "sm" | "md" | "lg" | "xl";
}

export default function StickyRightSidebar({
  children,
  className,
  width = "md",
}: StickyRightSidebarProps) {
  const widthClasses = {
    sm: "w-64", // 256px
    md: "w-80", // 320px
    lg: "w-96", // 384px
    xl: "w-[28rem]", // 448px
  };

  return (
    <aside
      className={cn(
        // Base positioning and sizing
        "sticky top-24 h-fit max-h-[calc(100vh-6rem)]",

        // Width based on prop
        widthClasses[width],

        // Styling

        // Responsive behavior
        "hidden lg:block",

        className
      )}
    >
      {children}
    </aside>
  );
}
