import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import Card from "@/components/shared/card";
import StickyRightSidebar from "@/components/layout/sticky-right-sidebar";
import type {
  QuickActionItem,
  TransactionSummaryItem,
} from "../types/transaction.model";

const TREND_META = {
  up: { icon: ArrowUpRightIcon, color: "text-emerald-600" },
  down: { icon: ArrowDownRightIcon, color: "text-rose-600" },
  flat: { icon: MinusIcon, color: "text-muted-foreground" },
} as const;

interface TransactionSidebarProps {
  summaryHeading: string;
  summary: TransactionSummaryItem[];
  actions: QuickActionItem[];
  showTrends: boolean;
  tipHeading: string;
  tip: string;
}

export function TransactionSidebar({
  summaryHeading,
  summary,
  actions,
  showTrends,
  tipHeading,
  tip,
}: TransactionSidebarProps) {
  return (
    <StickyRightSidebar>
      <div className="space-y-4">
        <Card>
          <h3 className="text-lg font-semibold">{summaryHeading}</h3>
          <div className="mt-4 space-y-3">
            {summary.map((item) => {
              const trend = item.trend ?? "flat";
              const TrendIcon = TREND_META[trend].icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4"
                >
                  <p className="text-muted-foreground text-sm">{item.label}</p>
                  <div className="flex items-center gap-2">
                    {showTrends && item.trend ? (
                      <TrendIcon
                        className={`size-4 ${TREND_META[trend].color}`}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="font-medium tabular-nums">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold">Quick Actions</h4>
          <div className="mt-4 space-y-2">
            {actions.map((action) => (
              <button
                key={action.id}
                className="hover:bg-accent w-full rounded p-2 text-left text-sm"
                type="button"
                onClick={action.callback}
              >
                <span className="block font-medium">{action.label}</span>
                {action.description ? (
                  <span className="text-muted-foreground text-xs">
                    {action.description}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold">{tipHeading}</h4>
          <p className="text-muted-foreground mt-2 text-sm">{tip}</p>
        </Card>
      </div>
    </StickyRightSidebar>
  );
}
