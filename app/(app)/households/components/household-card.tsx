"use client";

import { useState } from "react";
import { CheckIcon, LogOutIcon, PencilIcon, XIcon } from "lucide-react";
import Card from "@/components/shared/card";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOUSEHOLD_NAME_MAX_LENGTH } from "@/lib/household";
import type { Household } from "@/types/household.api";

interface HouseholdCardProps {
  household: Household;
  /** Resolves to whether the rename actually took. */
  onRename: (name: string) => Promise<boolean>;
  onLeave: () => void;
  pending: boolean;
}

/** Name, what sharing means, and the way out. */
export default function HouseholdCard({
  household,
  onRename,
  onLeave,
  pending,
}: HouseholdCardProps) {
  const [draftName, setDraftName] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const isEditing = draftName !== null;
  const isLastMember = household.members.length === 1;

  const commitRename = async (): Promise<void> => {
    if (draftName === null || draftName.trim() === household.name) {
      setDraftName(null);
      return;
    }

    // The editor stays open on failure. Closing it would discard the edit and snap the
    // heading back to the old name, which reads as "saved" for a rename that did not
    // happen.
    if (await onRename(draftName)) {
      setDraftName(null);
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              maxLength={HOUSEHOLD_NAME_MAX_LENGTH}
              aria-label="Household name"
              onKeyDown={(event) => {
                if (event.key === "Enter") void commitRename();
                if (event.key === "Escape") setDraftName(null);
              }}
            />
            <Button
              size="sm"
              onClick={() => void commitRename()}
              disabled={pending}
            >
              <CheckIcon aria-hidden="true" />
              <span className="sr-only">Save name</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDraftName(null)}
            >
              <XIcon aria-hidden="true" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{household.name}</h2>
            {household.isOwner ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDraftName(household.name)}
                disabled={pending}
              >
                <PencilIcon aria-hidden="true" />
                <span className="sr-only">Rename household</span>
              </Button>
            ) : null}
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => setConfirmingLeave(true)}
          disabled={pending}
        >
          <LogOutIcon aria-hidden="true" />
          Leave
        </Button>
      </div>

      <p className="text-muted-foreground max-w-prose text-sm">
        Everyone here shares one set of income, expenses, categories, recurring
        items and dashboard.
      </p>

      <ConfirmDeleteDialog
        open={confirmingLeave}
        onOpenChange={setConfirmingLeave}
        title="Leave this household?"
        itemName={household.name}
        confirmLabel="Leave"
        cancelLabel="Stay"
        description={
          <>
            Your records stop being visible to{" "}
            <span className="text-foreground font-medium">
              {household.name}
            </span>
            , and theirs stop being visible to you. Nothing is deleted — your
            own income and expenses go back to being yours alone.
            {isLastMember
              ? " You are the last member, so the household will be closed."
              : null}
          </>
        }
        onConfirm={() => {
          setConfirmingLeave(false);
          onLeave();
        }}
      />
    </Card>
  );
}
