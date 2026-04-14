"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CategoryType } from "@/types/shared/enums";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import { getTransactions } from "@/lib/api/transactions";
import {
  type DashboardPeriodPreset,
  resolvePeriodRange,
} from "@/components/dashboard/date-range";
import {
  barChartDataFromTotals,
  filterTransactionsByRange,
  monthlyAverages,
  pieByCategory,
} from "@/components/dashboard/aggregates";

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const presetLabels: Record<DashboardPeriodPreset, string> = {
  last_month: "Last month",
  last_3_months: "Last 3 months",
  last_6_months: "Last 6 months",
  last_12_months: "Last 12 months",
  ytd: "Year to date",
  all: "All records",
  custom: "Custom range",
};

const barChartConfig = {
  value: { label: "Amount" },
  Income: { label: "Income", color: "var(--chart-1)" },
  Expenses: { label: "Expenses", color: "var(--chart-2)" },
  Savings: { label: "Savings", color: "var(--chart-3)" },
} satisfies ChartConfig;

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateInput(s: string): Date | null {
  if (!s) {
    return null;
  }
  const [y, m, day] = s.split("-").map(Number);
  if (y === undefined || m === undefined || day === undefined) {
    return null;
  }
  return new Date(y, m - 1, day);
}

export default function DashboardClient(): React.ReactNode {
  const [mockNow] = React.useState(() => new Date());
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dataSource, setDataSource] = React.useState<
    "live" | "unavailable"
  >("live");

  const [preset, setPreset] =
    React.useState<DashboardPeriodPreset>("last_3_months");
  const [customStartStr, setCustomStartStr] = React.useState(() =>
    toDateInputValue(
      resolvePeriodRange("last_3_months", mockNow, null, null)?.start ??
        mockNow,
    ),
  );
  const [customEndStr, setCustomEndStr] = React.useState(() =>
    toDateInputValue(
      resolvePeriodRange("last_3_months", mockNow, null, null)?.end ?? mockNow,
    ),
  );

  const range = React.useMemo(() => {
    const cs = parseDateInput(customStartStr);
    const ce = parseDateInput(customEndStr);
    return resolvePeriodRange(preset, mockNow, cs, ce);
  }, [customEndStr, customStartStr, mockNow, preset]);

  React.useEffect(() => {
    const controller = new AbortController();
    const cs = parseDateInput(customStartStr);
    const ce = parseDateInput(customEndStr);
    const resolvedRange = resolvePeriodRange(preset, mockNow, cs, ce);

    setIsLoading(true);
    void (async () => {
      try {
        const rows =
          resolvedRange === null
            ? await getTransactions(undefined, { signal: controller.signal })
            : await getTransactions(
                {
                  from: resolvedRange.start.toISOString(),
                  to: resolvedRange.end.toISOString(),
                },
                { signal: controller.signal },
              );
        if (controller.signal.aborted) {
          return;
        }
        setTransactions(rows);
        setDataSource("live");
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        toast.error("Could not load transactions.");
        setTransactions([]);
        setDataSource("unavailable");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [customEndStr, customStartStr, mockNow, preset]);

  const filtered = React.useMemo(
    () => filterTransactionsByRange(transactions, range),
    [range, transactions],
  );

  const barData = React.useMemo(
    () => barChartDataFromTotals(filtered),
    [filtered],
  );
  const expensePie = React.useMemo(
    () => pieByCategory(filtered, CategoryType.Expense),
    [filtered],
  );
  const incomePie = React.useMemo(
    () => pieByCategory(filtered, CategoryType.Income),
    [filtered],
  );

  const { avgIncome, avgExpenses, months } = React.useMemo(
    () => monthlyAverages(filtered, range),
    [filtered, range],
  );

  const expensePieConfig = React.useMemo(() => {
    const c: ChartConfig = { value: { label: "Amount" } };
    expensePie.forEach((s) => {
      c[s.categoryName] = { label: s.categoryName, color: s.fill };
    });
    return c;
  }, [expensePie]);

  const incomePieConfig = React.useMemo(() => {
    const c: ChartConfig = { value: { label: "Amount" } };
    incomePie.forEach((s) => {
      c[s.categoryName] = { label: s.categoryName, color: s.fill };
    });
    return c;
  }, [incomePie]);

  const pieDataExpense = expensePie.map((s) => ({
    name: s.categoryName,
    value: s.value,
    fill: s.fill,
  }));
  const pieDataIncome = incomePie.map((s) => ({
    name: s.categoryName,
    value: s.value,
    fill: s.fill,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[220px] space-y-2">
          <label htmlFor="dashboard-period" className="text-sm font-medium">
            Period
          </label>
          <Select
            value={preset}
            onValueChange={(v) => setPreset(v as DashboardPeriodPreset)}
          >
            <SelectTrigger id="dashboard-period" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(presetLabels) as DashboardPeriodPreset[]).map(
                (key) => (
                  <SelectItem key={key} value={key}>
                    {presetLabels[key]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        {preset === "custom" ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <label htmlFor="dash-from" className="text-sm font-medium">
                From
              </label>
              <Input
                id="dash-from"
                type="date"
                value={customStartStr}
                onChange={(e) => setCustomStartStr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dash-to" className="text-sm font-medium">
                To
              </label>
              <Input
                id="dash-to"
                type="date"
                value={customEndStr}
                onChange={(e) => setCustomEndStr(e.target.value)}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly average income</CardTitle>
            <CardDescription>
              Total income divided by {months} month{months === 1 ? "" : "s"} in
              range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {currency.format(avgIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Monthly average expenses
            </CardTitle>
            <CardDescription>
              Total expenses divided by {months} month{months === 1 ? "" : "s"}{" "}
              in range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {currency.format(avgExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
          <CardDescription>
            Income, expenses, and savings for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={barChartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              data={barData}
              accessibilityLayer
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) =>
                  typeof v === "number" ? currency.format(v) : String(v)
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(val) => currency.format(Number(val))}
                  />
                }
              />
              <Bar dataKey="value" radius={6}>
                {barData.map((row, i) => (
                  <Cell key={row.label} fill={`var(--chart-${(i % 5) + 1})`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
            <CardDescription>Share of spending in this period</CardDescription>
          </CardHeader>
          <CardContent>
            {expensePie.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No expense transactions in this period.
              </p>
            ) : (
              <ChartContainer
                config={expensePieConfig}
                className="aspect-square max-h-[320px] w-full mx-auto"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(val) => currency.format(Number(val))}
                        nameKey="name"
                      />
                    }
                  />
                  <Pie
                    data={pieDataExpense}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={100}
                    paddingAngle={2}
                    strokeWidth={1}
                  />
                  <Legend
                    content={
                      <ChartLegendContent
                        nameKey="name"
                        className="max-h-24 flex-wrap gap-x-4 gap-y-2 overflow-auto px-1"
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income by category</CardTitle>
            <CardDescription>Share of income in this period</CardDescription>
          </CardHeader>
          <CardContent>
            {incomePie.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No income transactions in this period.
              </p>
            ) : (
              <ChartContainer
                config={incomePieConfig}
                className="aspect-square max-h-[320px] w-full mx-auto"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(val) => currency.format(Number(val))}
                        nameKey="name"
                      />
                    }
                  />
                  <Pie
                    data={pieDataIncome}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={100}
                    paddingAngle={2}
                    strokeWidth={1}
                  />
                  <Legend
                    content={
                      <ChartLegendContent
                        nameKey="name"
                        className="max-h-24 flex-wrap gap-x-4 gap-y-2 overflow-auto px-1"
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground text-xs">
        {isLoading
          ? "Loading transactions…"
          : dataSource === "live"
            ? "Live data from your transactions."
            : "API unavailable — showing no data."}
      </p>
    </div>
  );
}
