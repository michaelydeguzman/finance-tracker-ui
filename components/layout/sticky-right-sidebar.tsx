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
    sm: "lg:w-64", // 256px
    md: "lg:w-80", // 320px
    lg: "lg:w-96", // 384px
    xl: "lg:w-[28rem]", // 448px
  };

  return (
    <aside
      className={cn(
        // Full width and in the page flow below `lg`, where it stacks above the
        // content; a sticky column beside it from `lg` up.
        "w-full lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100vh-6rem)]",
        widthClasses[width],
        className,
      )}
    >
      {children}
    </aside>
  );
}
