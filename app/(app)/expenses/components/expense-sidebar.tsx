import Card from "@/components/shared/card";
import StickyRightSidebar from "@/components/layout/sticky-right-sidebar";
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import type {
  ExpenseQuickAction,
  ExpenseSummaryItem,
  UpcomingBill,
} from "../types/expense.model";

interface ExpenseSidebarProps {
  summary: ExpenseSummaryItem[];
  actions: ExpenseQuickAction[];
  upcomingBills: UpcomingBill[];
}

const TREND_META = {
  up: { icon: ArrowUpRightIcon, color: "text-emerald-600" },
  down: { icon: ArrowDownRightIcon, color: "text-rose-600" },
  flat: { icon: MinusIcon, color: "text-muted-foreground" },
} as const;

type TrendKey = keyof typeof TREND_META;

export function ExpenseSidebar({
  summary,
  actions,
  upcomingBills,
}: ExpenseSidebarProps) {
  return (
    <StickyRightSidebar>
      <div className="space-y-4">
        <Card>
          <h3 className="font-semibold text-lg">Spending Summary</h3>
          <div className="space-y-3 mt-4">
            {summary.map((item) => {
              const trendKey = (item.trend ?? "flat") as TrendKey;
              const TrendIcon = TREND_META[trendKey].icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {item.label}
                    </p>
                    {item.variance && (
                      <p className="text-xs text-muted-foreground">
                        {item.variance}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon
                      className={`size-4 ${TREND_META[trendKey].color}`}
                    />
                    <span className="font-medium">{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h4 className="font-semibold text-lg">Upcoming Bills</h4>
          <div className="space-y-3 mt-4">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bill.dueDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{bill.amount}</p>
                  {bill.autoPay && (
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Auto-pay
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h4 className="font-semibold text-lg">Quick Actions</h4>
          <div className="space-y-2 mt-4">
            {actions.map((action) => (
              <button
                key={action.id}
                className="w-full text-left text-sm p-2 hover:bg-accent rounded"
                type="button"
                onClick={action.callback}
              >
                <span className="block font-medium">{action.label}</span>
                {action.description && (
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h4 className="font-semibold text-lg">Tip</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Batch upload paper receipts at the end of each week to keep tracked
            totals aligned before budgets reset.
          </p>
        </Card>
      </div>
    </StickyRightSidebar>
  );
}
