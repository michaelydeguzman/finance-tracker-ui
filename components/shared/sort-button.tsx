"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

type SortButtonProps = {
  label: string;
  sort: "asc" | "desc" | null;
  onToggle: () => void;
  className?: string;
};

export function SortButton({
  label,
  sort,
  onToggle,
  className,
}: SortButtonProps) {
  const getSortIcon = () => {
    const classNames = "ml-2 h-4 w-4";
    switch (sort) {
      case "asc":
        return <ChevronUp className={classNames} />;
      case "desc":
        return <ChevronDown className={classNames} />;
      default:
        return <ChevronsUpDown className={classNames} />;
    }
  };

  return (
    <Button
      variant={sort === null ? "ghost" : "secondary"}
      size="lg"
      className={cn("flex items-center gap-1", className)}
      onClick={onToggle}
    >
      <span>{label}</span>
      {getSortIcon()}
    </Button>
  );
}
