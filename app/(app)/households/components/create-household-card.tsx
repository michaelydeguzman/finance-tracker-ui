"use client";

import { useState } from "react";
import { HouseIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { HOUSEHOLD_NAME_MAX_LENGTH } from "@/lib/household";

interface CreateHouseholdCardProps {
  /** Resolves to whether the household was actually created. */
  onCreate: (name: string) => Promise<boolean>;
  pending: boolean;
}

/**
 * Shown to someone in no household. Says plainly what creating one does, because the
 * consequence — other people reading your income and expenses — is not obvious from a
 * button labelled "Create".
 */
export default function CreateHouseholdCard({
  onCreate,
  pending,
}: CreateHouseholdCardProps) {
  const [name, setName] = useState("");

  const submit = async (): Promise<void> => {
    // Cleared only once the household exists. Clearing on submit throws the name away
    // every time the server says no — a one-household-per-person conflict, a dropped
    // connection — and leaves the user retyping something they already typed correctly.
    if (await onCreate(name)) {
      setName("");
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-3 py-6">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <HouseIcon className="size-6" aria-hidden="true" />
        </span>

        <h2 className="text-lg font-semibold">Start a household</h2>

        <p className="text-muted-foreground max-w-prose text-sm">
          Everyone in a household sees the same income, expenses, categories,
          recurring items and dashboard. Your existing records come with you,
          and you can leave at any time — they go back to being yours alone.
        </p>

        <form
          className="flex max-w-md flex-col gap-2 pt-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={HOUSEHOLD_NAME_MAX_LENGTH}
            placeholder="De Guzman Household"
            aria-label="Household name"
            disabled={pending}
          />
          <Button type="submit" disabled={pending || name.trim().length === 0}>
            {pending ? <Spinner /> : null}
            Create household
          </Button>
        </form>
      </div>
    </Card>
  );
}
