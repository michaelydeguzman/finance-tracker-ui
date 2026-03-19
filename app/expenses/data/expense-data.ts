import type {
  ExpenseEntry,
  ExpenseQuickAction,
  ExpenseSummaryItem,
  UpcomingBill,
} from "../types/expense.model";

export const expenseEntries: ExpenseEntry[] = [
  {
    id: "expense-2026-01-05-0815",
    title: "St. Lawrence Grocer",
    description: "Weekly produce and pantry restock.",
    amount: 185.43,
    currency: "CAD",
    category: "Groceries",
    date: new Date("2026-01-05T08:15:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-05-1230",
    title: "Downtown Parking",
    description: "Parking garage fee near client office.",
    amount: 28.5,
    currency: "CAD",
    category: "Transportation",
    date: new Date("2026-01-05T12:30:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-05-1910",
    title: "Family Dinner",
    description: "Birthday dinner reservation at Lune.",
    amount: 142.87,
    currency: "CAD",
    category: "Dining",
    date: new Date("2026-01-05T19:10:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-06-0730",
    title: "PRESTO Reload",
    description: "Monthly transit pass reload.",
    amount: 156,
    currency: "CAD",
    category: "Transportation",
    date: new Date("2026-01-06T07:30:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-06-1015",
    title: "Kids Activity Center",
    description: "Gymnastics class fees for winter session.",
    amount: 220,
    currency: "CAD",
    category: "Childcare",
    date: new Date("2026-01-06T10:15:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-06-1545",
    title: "Pharmacy Pickup",
    description: "Prescription refill and vitamins.",
    amount: 64.32,
    currency: "CAD",
    category: "Health",
    date: new Date("2026-01-06T15:45:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-07-0900",
    title: "Condo Fees",
    description: "Monthly condo maintenance dues.",
    amount: 575,
    currency: "CAD",
    category: "Housing",
    date: new Date("2026-01-07T09:00:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-07-1100",
    title: "Fuel Top-Up",
    description: "Gas refill for family SUV.",
    amount: 82.19,
    currency: "CAD",
    category: "Transportation",
    date: new Date("2026-01-07T11:00:00-05:00").toISOString(),
  },
  {
    id: "expense-2026-01-07-2000",
    title: "Streaming Bundle",
    description: "Family streaming subscriptions (annual).",
    amount: 219.99,
    currency: "CAD",
    category: "Entertainment",
    date: new Date("2026-01-07T20:00:00-05:00").toISOString(),
  },
];

export const expenseSummary: ExpenseSummaryItem[] = [
  { label: "This Month", value: "$1,673", variance: "+4%", trend: "up" },
  { label: "Last Month", value: "$1,607", variance: "-1%", trend: "down" },
  { label: "Avg. 3 Months", value: "$1,645", variance: "flat", trend: "flat" },
];

export const expenseQuickActions: ExpenseQuickAction[] = [
  { id: "log-receipt", label: "Log a Receipt", description: "Attach a photo" },
  {
    id: "split-bill",
    label: "Split Bill",
    description: "Share with household",
  },
  { id: "set-budget", label: "Adjust Budget", description: "Update limits" },
];

export const upcomingBills: UpcomingBill[] = [
  {
    id: "bill-utilities",
    name: "Hydro Utilities",
    amount: "$118",
    dueDate: "Due Jan 12",
    status: "scheduled",
    autoPay: true,
  },
  {
    id: "bill-insurance",
    name: "Auto Insurance",
    amount: "$156",
    dueDate: "Due Jan 15",
    status: "due",
  },
  {
    id: "bill-internet",
    name: "Fiber Internet",
    amount: "$98",
    dueDate: "Due Jan 19",
    status: "scheduled",
    autoPay: true,
  },
];
