"use client";

import type { ReactElement, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

export type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "Delete transaction?" */
  title: string;
  /** Name of the record being removed, shown in the description. */
  itemName: string;
  onConfirm: () => void;
  /**
   * Replaces the default "permanently remove" wording. For a destructive action
   * that is not a deletion — cancelling a recurring template keeps the row and
   * its history — the default sentence would simply be untrue.
   */
  description?: ReactNode;
  /** Defaults to "Delete". */
  confirmLabel?: string;
  /** Defaults to "Cancel". Worth overriding where "Cancel" is the action itself. */
  cancelLabel?: string;
};

/**
 * Shared destructive-action confirmation. Replaces the browser `confirm()`
 * that the categories flow used, so every delete looks the same.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  itemName,
  onConfirm,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: ConfirmDeleteDialogProps): ReactElement {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                This will permanently remove{" "}
                <span className="text-foreground font-medium">{itemName}</span>.
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => onConfirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
