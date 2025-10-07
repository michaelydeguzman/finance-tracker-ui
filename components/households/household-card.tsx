import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface HouseholdCardProps {
  name: string;
  memberCount: number;
  totalIncome: number;
  totalExpenses: number;
  className?: string;
}

export default function HouseholdCard({
  name,
  memberCount,
  totalIncome,
  totalExpenses,
  className,
}: HouseholdCardProps) {
  const netAmount = totalIncome - totalExpenses;
  const isPositive = netAmount >= 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{memberCount} members</div>
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Income</span>
            </div>
            <span className="text-sm font-medium text-green-600">
              ${totalIncome.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Expenses</span>
            </div>
            <span className="text-sm font-medium text-red-600">
              ${totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Net</span>
            </div>
            <span
              className={`text-sm font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              ${Math.abs(netAmount).toLocaleString()}
            </span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
