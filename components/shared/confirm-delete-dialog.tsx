"use client";

import type { ReactElement } from "react";
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
}: ConfirmDeleteDialogProps): ReactElement {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{" "}
            <span className="text-foreground font-medium">{itemName}</span>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => onConfirm()}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
