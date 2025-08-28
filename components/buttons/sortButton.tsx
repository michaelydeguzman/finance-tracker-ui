"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

type SortButtonProps = {
  label: string;
  sort: "asc" | "desc" | null;
  onToggle: () => void;
};

export function SortButton({ label, sort, onToggle }: SortButtonProps) {
  const getSortIcon = () => {
    switch (sort) {
      case "asc":
        return <ChevronUp className="ml-2 h-4 w-4" />;
      case "desc":
        return <ChevronDown className="ml-2 h-4 w-4" />;
      default:
        return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
  };

  return (
    <Button
      variant={sort === null ? "ghost" : "secondary"}
      size="lg"
      className="flex items-center gap-1"
      onClick={onToggle}
    >
      <span>{label}</span>
      {getSortIcon()}
    </Button>
  );
}
