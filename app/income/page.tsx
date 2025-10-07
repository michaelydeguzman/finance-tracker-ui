import PageTitle from "@/components/common/page-title";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import StickyRightSidebar from "@/components/common/sticky-right-sidebar";
import Card from "@/components/common/card";

export default function Income() {
  // Sample sidebar content for testing
  const sidebarContent = (
    <StickyRightSidebar>
      <div className="space-y-4 mt-20">
        <Card>
          <h3 className="font-semibold text-lg">Income Summary</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium">$5,240</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Month</span>
              <span className="font-medium">$4,980</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average</span>
              <span className="font-medium">$5,110</span>
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-sm p-2 hover:bg-accent rounded">
                Add Income
              </button>
              <button className="w-full text-left text-sm p-2 hover:bg-accent rounded">
                Export Data
              </button>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-lg">Tips</h3>
        </Card>
      </div>
    </StickyRightSidebar>
  );

  return (
    <PageWithSidebar sidebar={sidebarContent}>
      <div className="space-y-6">
        <PageTitle title="Income" subtitle="De Guzman Household" />

        <div className="space-y-4">
          {/* Main content */}
          <div className="space-y-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <h4 className="font-medium">Income Entry #{i + 1}</h4>
                <p className="text-sm text-muted-foreground">
                  This is a sample income entry to test the scrolling behavior
                  of the sticky sidebar.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWithSidebar>
  );
}
