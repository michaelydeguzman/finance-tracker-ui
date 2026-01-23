import type {
  IncomeEntry,
  IncomeSummaryItem,
  QuickActionItem,
} from "../_types/income.model";

export const incomeEntries: IncomeEntry[] = [
  {
    id: "income-2026-01-05-0900",
    title: "January Paycheck",
    description: "Primary salary deposit for January payroll cycle.",
    amount: 4200,
    currency: "CAD",
    category: "Salary",
    date: new Date("2026-01-05T09:00:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-05-1330",
    title: "Side Project Milestone",
    description: "Payment for landing page redesign milestone.",
    amount: 750,
    currency: "CAD",
    category: "Freelance",
    date: new Date("2026-01-05T13:30:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-05-2000",
    title: "Cashback Rewards",
    description: "Monthly cashback payout from credit card rewards.",
    amount: 85,
    currency: "CAD",
    category: "Other",
    date: new Date("2026-01-05T20:00:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-06-0830",
    title: "Contract Retainer",
    description: "Weekly retainer payment from consulting client.",
    amount: 950,
    currency: "CAD",
    category: "Freelance",
    date: new Date("2026-01-06T08:30:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-06-1015",
    title: "Child Care Benefit",
    description: "Government childcare benefit deposit.",
    amount: 260,
    currency: "CAD",
    category: "Benefit",
    date: new Date("2026-01-06T10:15:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-06-1715",
    title: "Stock Dividends",
    description: "Quarterly dividend payout from investment portfolio.",
    amount: 180,
    currency: "CAD",
    category: "Investments",
    date: new Date("2026-01-06T17:15:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-07-0900",
    title: "Partner Salary",
    description: "Salary deposit for partner's employer.",
    amount: 3900,
    currency: "CAD",
    category: "Salary",
    date: new Date("2026-01-07T09:00:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-07-1200",
    title: "Tutoring Session",
    description: "Weekend tutoring session payment.",
    amount: 120,
    currency: "CAD",
    category: "Side Income",
    date: new Date("2026-01-07T12:00:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-07-1630",
    title: "Equipment Reimbursement",
    description: "Work reimbursement for home office equipment.",
    amount: 210,
    currency: "CAD",
    category: "Reimbursement",
    date: new Date("2026-01-07T16:30:00-05:00").toISOString(),
  },
  {
    id: "income-2026-01-07-2100",
    title: "Marketplace Sale",
    description: "Sold unused furniture on local marketplace.",
    amount: 180,
    currency: "CAD",
    category: "Other",
    date: new Date("2026-01-07T21:00:00-05:00").toISOString(),
  },
];

export const incomeSummary: IncomeSummaryItem[] = [
  { label: "This Month", value: "$5,240", trend: "up" },
  { label: "Last Month", value: "$4,980", trend: "flat" },
  { label: "Average", value: "$5,110", trend: "up" },
];

export const quickActions: QuickActionItem[] = [
  { id: "add-income", label: "Add Income", description: "Log new earnings" },
  { id: "export", label: "Export Data", description: "Download CSV" },
];
