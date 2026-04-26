import Card from "@/components/shared/card";
import StickyRightSidebar from "@/components/layout/sticky-right-sidebar";
import type {
  TransactionSummaryItem,
  QuickActionItem,
} from "../../../transactions/types/transaction.model";

interface IncomeSidebarProps {
  summary: TransactionSummaryItem[];
  actions: QuickActionItem[];
}

export function IncomeSidebar({ summary, actions }: IncomeSidebarProps) {
  return (
    <StickyRightSidebar>
      <div className="space-y-4">
        <Card>
          <h3 className="font-semibold text-lg">Income Summary</h3>

          <div className="space-y-2 mt-4">
            {summary.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <hr className="border-border my-4" />

          <div>
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="space-y-2">
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
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-lg">Tips</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Track recurring income sources separately to identify volatility in
            freelance or commission-based work.
          </p>
        </Card>
      </div>
    </StickyRightSidebar>
  );
}
