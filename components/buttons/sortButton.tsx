"use client";

import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

type SortButtonProps = {
  label: string;
  sort: "asc" | "desc" | null;
  onToggle: () => void;
};

export function SortButton({ label, sort, onToggle }: SortButtonProps) {
  const getSortIcon = () => {
    switch (sort) {
      case "asc":
        return <ArrowUpIcon className="ml-2 h-4 w-4" />;
      case "desc":
        return <ArrowDownIcon className="ml-2 h-4 w-4" />;
      default:
        return <ArrowUpDownIcon className="ml-2 h-4 w-4" />;
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
