import { describe, expect, it } from "vitest";
import { filterTransactionsByCategories } from "@/app/transactions/data/transaction-data";
import type { Transaction } from "@/app/transactions/types/transaction.model";
import { CategoryType } from "@/types/shared/enums";

const tx = (categoryId: string, name = "Item"): Transaction => ({
  id: crypto.randomUUID(),
  name,
  categoryId,
  categoryName: categoryId,
  categoryType: CategoryType.Expense,
  description: "",
  amount: 10,
  transactionDate: new Date(2026, 5, 3),
  createdAt: new Date(2026, 5, 3),
  createdBy: "test",
});

const gas = tx("gas", "Costco Gas");
const groceries = tx("groceries", "Superstore");
const travel = tx("travel", "Grouse Mountain");
const all = [gas, groceries, travel];

describe("filterTransactionsByCategories", () => {
  it("returns everything when no category is selected", () => {
    expect(filterTransactionsByCategories(all, [])).toEqual(all);
  });

  it("keeps only transactions in the selected category", () => {
    expect(filterTransactionsByCategories(all, ["gas"])).toEqual([gas]);
  });

  it("treats multiple selections as OR", () => {
    expect(filterTransactionsByCategories(all, ["gas", "travel"])).toEqual([
      gas,
      travel,
    ]);
  });

  it("returns nothing when the selected category has no transactions", () => {
    expect(filterTransactionsByCategories(all, ["subscriptions"])).toEqual([]);
  });

  it("preserves the original ordering", () => {
    expect(
      filterTransactionsByCategories(all, ["travel", "gas"]).map((t) => t.name),
    ).toEqual(["Costco Gas", "Grouse Mountain"]);
  });
});
