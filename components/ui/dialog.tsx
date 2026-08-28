"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Layers that legitimately hold the pointer-events lock while they are open. */
const OPEN_LAYER_SELECTOR =
  '[data-slot="dialog-content"], [data-radix-popper-content-wrapper], [role="listbox"]';

/**
 * Clears a pointer-events lock that Radix left behind, once nothing still needs it.
 *
 * Every Radix layer sets `body { pointer-events: none }` while open and restores
 * whatever value it captured when it opened. A Select opened inside a Dialog
 * captures the Dialog's own "none", so when the two close in the same commit the
 * Select faithfully restores "none" and the Dialog is already gone — leaving the
 * entire page unclickable with no visible modal to explain it.
 *
 * Closing a dialog by unmounting it (`{open ? <Dialog /> : null}`, which is how
 * every dialog in this app is written) is what puts them in the same commit.
 *
 * Deferred by a tick so it runs after Radix's own teardown, and gated on no layer
 * remaining so a dialog that is still legitimately open keeps its lock.
 */
function releaseStrandedPointerEvents(): () => void {
  const timer = window.setTimeout(() => {
    if (document.querySelector(OPEN_LAYER_SELECTOR)) return;
    if (document.body.style.pointerEvents !== "none") return;

    document.body.style.pointerEvents = "";
  }, 0);

  return () => window.clearTimeout(timer);
}

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  // Read rather than destructured: exactOptionalPropertyTypes forbids handing
  // `open` back as `boolean | undefined`, so the spread has to stay intact.
  const { open } = props;

  // Closed while still mounted.
  React.useEffect(() => {
    if (open) return;

    return releaseStrandedPointerEvents();
  }, [open]);

  // Unmounted outright, which is how this app closes its dialogs.
  React.useEffect(() => () => void releaseStrandedPointerEvents(), []);

  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-card p-6 shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
          )}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
