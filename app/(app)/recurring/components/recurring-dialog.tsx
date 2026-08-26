"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/app/(app)/categories/types/category.model";
import { describeFrequency } from "../data/frequency-options";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MIN_AMOUNT,
  validateRecurringForm,
} from "../data/recurring-form";
import { toDateInputValue } from "../data/recurring-schedule";
import type { FrequencyOption } from "../types/frequency.model";
import type {
  RecurringTransaction,
  RecurringTransactionInput,
} from "../types/recurring.model";

export type RecurringDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  /** Required when `mode` is `"edit"` — the template being changed. */
  template?: RecurringTransaction | null;
  incomeCategories: Category[];
  expenseCategories: Category[];
  categoriesPending?: boolean;
  frequencies: FrequencyOption[];
  frequenciesPending?: boolean;
  /** Resolves `true` once the API has accepted the change, `false` otherwise. */
  onSubmit: (input: RecurringTransactionInput) => Promise<boolean>;
};

/**
 * Create / edit form for a recurring template.
 *
 * The dialog stays open when `onSubmit` resolves `false`: a rejected save keeps
 * everything the user typed, so a 400 or 409 does not cost them the form.
 */
export function RecurringDialog({
  open,
  onOpenChange,
  mode = "create",
  template = null,
  incomeCategories,
  expenseCategories,
  categoriesPending = false,
  frequencies,
  frequenciesPending = false,
  onSubmit,
}: RecurringDialogProps) {
  const isEdit = mode === "edit";

  // Seeded once per mount. The page only mounts this while it is open, so
  // opening the dialog is what produces fresh state.
  const [name, setName] = useState(() => template?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    () => template?.categoryId ?? "",
  );
  const [frequencyId, setFrequencyId] = useState(
    () => template?.frequencyId ?? "",
  );
  const [amount, setAmount] = useState(() =>
    template ? String(template.amount) : "",
  );
  const [description, setDescription] = useState(
    () => template?.description ?? "",
  );
  const [startDate, setStartDate] = useState(() =>
    toDateInputValue(template?.startDate ?? new Date()),
  );
  const [endDate, setEndDate] = useState(() =>
    template?.endDate ? toDateInputValue(template.endDate) : "",
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    const values = {
      name,
      categoryId,
      frequencyId,
      amount,
      startDate,
      endDate,
    };

    const invalid = validateRecurringForm(values);
    if (invalid) {
      toast.error(invalid.message);
      return;
    }

    setSubmitting(true);
    try {
      const saved = await onSubmit({
        name: name.trim(),
        categoryId,
        frequencyId,
        amount: Number(amount),
        startDate,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(endDate.trim() ? { endDate } : {}),
      });

      if (saved) onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryGroups = [
    { label: "Income", categories: incomeCategories },
    { label: "Expenses", categories: expenseCategories },
  ].filter((group) => group.categories.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit recurring transaction"
              : "New recurring transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changing the start date or frequency re-anchors the schedule."
              : "Set it up once, and each transaction is created for you when it falls due."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="recurring-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="recurring-name"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(event) => setName(event.target.value)}
              placeholder="Rent"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="recurring-category" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={categoriesPending}
            >
              <SelectTrigger id="recurring-category" className="w-full">
                <SelectValue
                  placeholder={
                    categoriesPending
                      ? "Loading categories…"
                      : "Select a category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {/* Grouped by type: the category is what decides whether this
                    template generates income or an expense. */}
                {categoryGroups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="recurring-amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="recurring-amount"
                type="number"
                inputMode="decimal"
                min={MIN_AMOUNT}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="recurring-frequency"
                className="text-sm font-medium"
              >
                Repeats
              </label>
              <Select
                value={frequencyId}
                onValueChange={setFrequencyId}
                disabled={frequenciesPending}
              >
                <SelectTrigger id="recurring-frequency" className="w-full">
                  <SelectValue
                    placeholder={frequenciesPending ? "Loading…" : "How often?"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((frequency) => {
                    const detail = describeFrequency(frequency);

                    return (
                      // One string rather than a name plus a styled subtitle:
                      // Radix mirrors the selected item's text into the
                      // trigger, so a second element would be rendered there
                      // too.
                      <SelectItem key={frequency.id} value={frequency.id}>
                        {detail
                          ? `${frequency.name} · ${detail}`
                          : frequency.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="recurring-start" className="text-sm font-medium">
                Starts
              </label>
              <Input
                id="recurring-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="recurring-end" className="text-sm font-medium">
                Ends (optional)
              </label>
              <Input
                id="recurring-end"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="recurring-description"
              className="text-sm font-medium"
            >
              Description (optional)
            </label>
            <Input
              id="recurring-description"
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Notes…"
            />
          </div>

          <p className="text-muted-foreground text-xs">
            The start date anchors the schedule. A date in the past is an
            anchor, not a backlog — nothing is created for occurrences that have
            already gone by.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner className="text-primary-foreground" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
