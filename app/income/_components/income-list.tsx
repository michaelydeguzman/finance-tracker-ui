import { ReceiptIcon } from "lucide-react";
import Card from "@/components/common/card";
import type { IncomeEntry } from "../_types/income.model";

interface IncomeListProps {
  entries: IncomeEntry[];
}

export function IncomeList({ entries }: IncomeListProps) {
  if (!entries.length) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          No income records yet. Start by logging your first entry.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="flex flex-col gap-2">
          <div className="p-4 rounded-lg flex items-center gap-4 border border-border">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <ReceiptIcon className="size-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{entry.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {entry.description}
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                Category: {entry.category}
              </div>
            </div>
            <div className="text-right">
              <span className="font-semibold">
                {entry.amount.toLocaleString(undefined, {
                  style: "currency",
                  currency: entry.currency,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
          <div className="border-b border-border" />
        </div>
      ))}
    </div>
  );
}
