import { describe, expect, it } from "vitest";
import { buildTransactionEntries } from "@/app/transactions/data/transaction-data";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";

const TRANSACTION_DATE = new Date(2026, 3, 25);
const CREATED_AT = new Date(2026, 3, 26, 9, 30);

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "tx-1",
  name: "Costco Gas",
  categoryId: "cat-gas",
  categoryName: "Gas",
  categoryType: CategoryType.Expense,
  description: "Filled up on the way home",
  amount: 70,
  transactionDate: TRANSACTION_DATE,
  createdAt: CREATED_AT,
  createdBy: "finance-tracker-ui",
  ...overrides,
});

describe("buildTransactionEntries", () => {
  it("carries the fields the collapsed row renders", () => {
    const [entry] = buildTransactionEntries([transaction()]);

    expect(entry).toMatchObject({
      id: "tx-1",
      title: "Costco Gas",
      category: "Gas",
      description: "Filled up on the way home",
      amount: 70,
      date: TRANSACTION_DATE.toISOString(),
    });
  });

  it("carries the created timestamp the expanded row needs", () => {
    const [entry] = buildTransactionEntries([transaction()]);

    expect(entry?.createdAt).toBe(CREATED_AT.toISOString());
  });

  it("keeps a real author", () => {
    const [entry] = buildTransactionEntries([
      transaction({ createdBy: "import" }),
    ]);

    expect(entry?.createdBy).toBe("import");
  });

  it("drops the app's own marker — it is not a meaningful author", () => {
    const [entry] = buildTransactionEntries([
      transaction({ createdBy: "finance-tracker-ui" }),
    ]);

    expect(entry?.createdBy).toBeUndefined();
  });

  it("drops a blank author", () => {
    const [entry] = buildTransactionEntries([transaction({ createdBy: "  " })]);

    expect(entry?.createdBy).toBeUndefined();
  });

  it("passes through a recurrence name when the transaction has one", () => {
    const [entry] = buildTransactionEntries([
      transaction({ frequencyName: "Monthly" }),
    ]);

    expect(entry?.frequencyName).toBe("Monthly");
  });

  it("leaves the recurrence name undefined for a one-off transaction", () => {
    const [entry] = buildTransactionEntries([
      transaction({ frequencyName: null }),
    ]);

    expect(entry?.frequencyName).toBeUndefined();
  });
});
