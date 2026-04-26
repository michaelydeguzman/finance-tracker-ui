"use client";

import { ReceiptTextIcon } from "lucide-react";
import type { ExpenseEntry } from "../types/expense.model";
import { TransactionEntryList } from "../../../transactions/components/transaction-entry-list";

interface ExpenseListProps {
  entries: ExpenseEntry[];
  pageSize?: number;
  pending?: boolean;
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

export function ExpenseList({
  entries,
  pageSize = 6,
  pending = false,
  onEditEntry,
  onDeleteEntry,
}: ExpenseListProps) {
  return (
    <TransactionEntryList
      entries={entries}
      pageSize={pageSize}
      pending={pending}
      loadingText="Loading expense transactions..."
      emptyText="No expenses yet. Upload your first receipt to start tracking."
      icon={<ReceiptTextIcon className="size-5" />}
      iconClassName="bg-destructive/10 text-destructive"
      amountPrefix="-"
      amountClassName="text-destructive"
      showDividers={false}
      {...(onEditEntry ? { onEditEntry } : {})}
      {...(onDeleteEntry ? { onDeleteEntry } : {})}
    />
  );
}
