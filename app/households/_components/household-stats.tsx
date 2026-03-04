import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HouseholdStatsProps {
  households: Array<{
    name: string;
    income: number;
    expenses: number;
  }>;
}

export default function HouseholdStats({ households }: HouseholdStatsProps) {
  const chartData = households.map((household) => ({
    name: household.name.split(" ")[0], // Shortened name for chart
    income: household.income,
    expenses: household.expenses,
    net: household.income - household.expenses,
  }));

  const totalIncome = households.reduce((sum, h) => sum + h.income, 0);
  const totalExpenses = households.reduce((sum, h) => sum + h.expenses, 0);
  const totalNet = totalIncome - totalExpenses;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalNet >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              ${Math.abs(totalNet).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Household Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `$${value.toLocaleString()}`,
                    name,
                  ]}
                />
                <Bar dataKey="income" fill="var(--success)" name="Income" />
                <Bar
                  dataKey="expenses"
                  fill="var(--destructive)"
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
