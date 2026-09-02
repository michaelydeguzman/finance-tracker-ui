"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CategoryType } from "@/types/shared/enums";
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
import { CategoryCombobox } from "@/components/shared/category-combobox";
import type { Category } from "@/app/(app)/categories/types/category.model";
import type { Transaction } from "../types/transaction.model";
import type { TransactionInput } from "../hooks/use-transactions";

export type AddTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryType: CategoryType.Income | CategoryType.Expense;
  mode?: "create" | "edit";
  /** Required when `mode` is `"edit"` — row being edited. */
  transaction?: Transaction | null;
  onSubmit?: (input: TransactionInput) => void;
  /** Required when `mode` is `"edit"`. */
  onUpdate?: (id: string, input: TransactionInput) => void;
  createdBy?: string;
  /** Fetched once by the page and shared by the add + edit dialogs. */
  categories: Category[];
  categoriesPending?: boolean;
};

const toDateInputValue = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function AddTransactionDialog({
  open,
  onOpenChange,
  categoryType,
  mode = "create",
  transaction = null,
  onSubmit,
  onUpdate,
  createdBy = "finance-tracker-ui",
  categories,
  categoriesPending = false,
}: AddTransactionDialogProps) {
  const isEdit = mode === "edit";

  // Seeded once per mount. The parent only mounts this while it is open, so
  // opening the dialog is what produces fresh state — no populate-on-open
  // effect, and no cascading render from setState inside an effect.
  const [name, setName] = useState(() =>
    isEdit && transaction ? transaction.name : "",
  );
  const [categoryId, setCategoryId] = useState<string>(() =>
    isEdit && transaction ? transaction.categoryId : "",
  );
  const [description, setDescription] = useState(() =>
    isEdit && transaction ? (transaction.description ?? "") : "",
  );
  const [amount, setAmount] = useState<string>(() =>
    isEdit && transaction ? String(transaction.amount) : "",
  );
  const [date, setDate] = useState<string>(() =>
    toDateInputValue(
      isEdit && transaction ? transaction.transactionDate : new Date(),
    ),
  );
  const [submitting, setSubmitting] = useState(false);

  const categoryById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const title = isEdit
    ? categoryType === CategoryType.Income
      ? "Edit income"
      : "Edit expense"
    : categoryType === CategoryType.Income
      ? "Add Income"
      : "Add Expense";

  const subtitle = isEdit
    ? "Update this transaction."
    : categoryType === CategoryType.Income
      ? "Log a new income transaction."
      : "Log a new expense transaction.";

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    const categoryName = categoryById.get(categoryId)?.trim() ?? "";
    if (!categoryName) {
      toast.error("Selected category is invalid.");
      return;
    }

    const transactionDate = new Date(date);
    if (Number.isNaN(transactionDate.getTime())) {
      toast.error("Transaction date is invalid.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: TransactionInput = {
        name: trimmedName,
        categoryId,
        categoryName,
        amount: numericAmount,
        transactionDate,
        frequencyId:
          isEdit && transaction ? (transaction.frequencyId ?? null) : null,
        frequencyName:
          isEdit && transaction ? (transaction.frequencyName ?? null) : null,
        createdBy:
          isEdit && transaction?.createdBy?.trim()
            ? transaction.createdBy
            : createdBy,
        ...(description.trim() ? { description: description.trim() } : {}),
      };

      if (isEdit) {
        if (!transaction?.id || !onUpdate) {
          toast.error("Nothing to update.");
          return;
        }
        onUpdate(transaction.id, payload);
        onOpenChange(false);
      } else {
        if (!onSubmit) {
          toast.error("Submit handler missing.");
          return;
        }
        onSubmit(payload);
        toast.success(`${title} saved.`);
        onOpenChange(false);
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to save transaction.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label
              htmlFor="transaction-category"
              className="text-sm font-medium"
            >
              Category
            </label>
            <CategoryCombobox
              id="transaction-category"
              value={categoryId}
              onValueChange={setCategoryId}
              categories={categories}
              disabled={categoriesPending}
              placeholder={
                categoriesPending
                  ? "Loading categories..."
                  : "Select a category"
              }
            />
            {categoriesPending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Spinner className="size-3" />
                <span>Fetching categories…</span>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                categoryType === CategoryType.Income ? "Salary" : "Groceries"
              }
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Description (optional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes..."
            />
          </div>
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
