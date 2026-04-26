"use client";

import { WalletIcon } from "lucide-react";
import type { TransactionEntry } from "../../../transactions/types/transaction.model";
import { TransactionEntryList } from "../../../transactions/components/transaction-entry-list";

interface IncomeListProps {
  entries: TransactionEntry[];
  pageSize?: number;
  pending?: boolean;
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

export function IncomeList({
  entries,
  pageSize = 6,
  pending = false,
  onEditEntry,
  onDeleteEntry,
}: IncomeListProps) {
  return (
    <TransactionEntryList
      entries={entries}
      pageSize={pageSize}
      pending={pending}
      loadingText="Loading income transactions..."
      emptyText="No income records yet. Start by logging your first entry."
      icon={<WalletIcon className="size-5" />}
      iconClassName="bg-green-500/10 text-green-600"
      {...(onEditEntry ? { onEditEntry } : {})}
      {...(onDeleteEntry ? { onDeleteEntry } : {})}
    />
  );
}
