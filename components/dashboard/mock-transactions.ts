import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";

const incomeCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Other income",
] as const;
const expenseCategories = [
  "Housing",
  "Groceries",
  "Transport",
  "Utilities",
  "Entertainment",
  "Health",
] as const;

function monthDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

type Row = {
  namePrefix: string;
  day: number;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  description: string;
  year: number;
  monthIndex: number;
};

/**
 * Deterministic mock data spanning ~15 months for dashboard aggregation demos.
 * Shape matches `Transaction`; replace with API + query params in a later phase.
 */
export function createMockDashboardTransactions(now: Date): Transaction[] {
  const rows: Row[] = [];
  let idSeq = 0;

  for (let mo = -14; mo <= 0; mo++) {
    const anchor = new Date(now.getFullYear(), now.getMonth() + mo, 1);
    const ty = anchor.getFullYear();
    const tm = anchor.getMonth();

    const push = (r: Omit<Row, "year" | "monthIndex">) => {
      rows.push({ ...r, year: ty, monthIndex: tm });
    };

    push({
      namePrefix: "Salary",
      day: 1,
      amount: 5200 + (mo % 3) * 120,
      categoryId: `inc-sal-${idSeq}`,
      categoryName: incomeCategories[0],
      categoryType: CategoryType.Income,
      description: "Payroll",
    });
    idSeq += 1;

    push({
      namePrefix: "Freelance",
      day: 14,
      amount: 400 + mo * 35,
      categoryId: `inc-free-${idSeq}`,
      categoryName: incomeCategories[1],
      categoryType: CategoryType.Income,
      description: "Client work",
    });
    idSeq += 1;

    if (mo % 2 === 0) {
      push({
        namePrefix: "Dividend",
        day: 20,
        amount: 180,
        categoryId: `inc-inv-${idSeq}`,
        categoryName: incomeCategories[2],
        categoryType: CategoryType.Income,
        description: "Quarterly",
      });
      idSeq += 1;
    }

    push({
      namePrefix: "Rent",
      day: 3,
      amount: 2100,
      categoryId: `exp-housing-${idSeq}`,
      categoryName: expenseCategories[0],
      categoryType: CategoryType.Expense,
      description: "Rent",
    });
    idSeq += 1;

    push({
      namePrefix: "Groceries",
      day: 8,
      amount: 520 + (mo % 4) * 40,
      categoryId: `exp-food-${idSeq}`,
      categoryName: expenseCategories[1],
      categoryType: CategoryType.Expense,
      description: "Supermarket",
    });
    idSeq += 1;

    push({
      namePrefix: "Fuel",
      day: 11,
      amount: 160 + (mo % 5) * 12,
      categoryId: `exp-car-${idSeq}`,
      categoryName: expenseCategories[2],
      categoryType: CategoryType.Expense,
      description: "Transit",
    });
    idSeq += 1;

    push({
      namePrefix: "Power",
      day: 18,
      amount: 95 + (mo % 3) * 8,
      categoryId: `exp-util-${idSeq}`,
      categoryName: expenseCategories[3],
      categoryType: CategoryType.Expense,
      description: "Electric",
    });
    idSeq += 1;

    push({
      namePrefix: "Fun",
      day: 22,
      amount: 120 + (mo % 6) * 25,
      categoryId: `exp-ent-${idSeq}`,
      categoryName: expenseCategories[4],
      categoryType: CategoryType.Expense,
      description: "Outings",
    });
    idSeq += 1;
  }

  return rows.map((row, idx) => {
    const transactionDate = monthDate(row.year, row.monthIndex, row.day);
    const createdAt = monthDate(row.year, row.monthIndex, Math.min(row.day + 1, 28));

    return {
      id: `mock-${idx}`,
      name: `${row.namePrefix} ${transactionDate.toLocaleString("default", { month: "short" })}`,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      categoryType: row.categoryType,
      description: row.description,
      amount: Math.round(row.amount * 100) / 100,
      transactionDate,
      createdAt,
      createdBy: "mock",
    };
  });
}
