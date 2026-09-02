"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sortByName } from "@/lib/category-sort";
import { cn } from "@/lib/utils";

/**
 * The shape this picker needs. Deliberately structural rather than the
 * `Category` model, so `components/shared/` keeps no dependency on a route's
 * types and anything id/name shaped can be passed in.
 */
export type CategoryOption = {
  id: string;
  name: string;
};

export type CategoryComboboxProps = {
  /** Applied to the trigger so a `<label htmlFor>` still points at the control. */
  id: string;
  /** Selected category id, or `""` when nothing is selected yet. */
  value: string;
  onValueChange: (categoryId: string) => void;
  categories: readonly CategoryOption[];
  disabled?: boolean;
  /** Trigger text while nothing is selected. */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
};

/**
 * A searchable, alphabetically ordered category picker.
 *
 * This is the shadcn Combobox pattern — `Popover` + `Command` (cmdk) — rather
 * than a `Select`, because a `Select` has nowhere to put a search field. It
 * keeps the same contract as the `Select` it replaces: a controlled category id
 * (`""` when unset), an `id` the form's label can point at, and no selection
 * until the user makes one.
 *
 * Items carry the category id as their cmdk value so the caller's state stays
 * id-based, and the name as a `keyword`. The custom `filter` matches on the
 * keywords alone: cmdk's default filter also scores the value, which would let
 * a typed hex string match a uuid nobody can see. Scores are 0/1, so cmdk's
 * score sort is a no-op and the alphabetical order below survives filtering.
 */
export function CategoryCombobox({
  id,
  value,
  onValueChange,
  categories,
  disabled = false,
  placeholder = "Select a category",
  searchPlaceholder = "Search categories...",
  emptyMessage = "No category found.",
  className,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => sortByName(categories), [categories]);

  const selectedName = useMemo(
    () => sorted.find((c) => c.id === value)?.name,
    [sorted, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between border-input px-3 font-normal",
            !selectedName && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selectedName ?? placeholder}</span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command
          filter={(_value, search, keywords) => {
            const term = search.trim().toLowerCase();
            if (!term) return 1;

            const haystack = (keywords ?? []).join(" ").toLowerCase();
            return haystack.includes(term) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {sorted.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  keywords={[category.name]}
                  // The id is read from the closure rather than `onSelect`'s
                  // argument: cmdk lowercases the value it hands back, which
                  // would corrupt an id that is not already lowercase.
                  onSelect={() => {
                    onValueChange(category.id);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{category.name}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      value === category.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
