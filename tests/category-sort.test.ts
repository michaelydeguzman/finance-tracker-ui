import { describe, expect, it } from "vitest";
import { sortByName } from "@/lib/category-sort";

const names = (items: readonly { name: string }[]) => items.map((i) => i.name);

describe("sortByName", () => {
  it("orders names alphabetically regardless of case", () => {
    const sorted = sortByName([
      { name: "utilities" },
      { name: "Groceries" },
      { name: "rent" },
      { name: "Bills" },
    ]);

    expect(names(sorted)).toEqual(["Bills", "Groceries", "rent", "utilities"]);
  });

  it("leaves the caller's array untouched", () => {
    const categories = [{ name: "Rent" }, { name: "Bills" }];

    sortByName(categories);

    expect(names(categories)).toEqual(["Rent", "Bills"]);
  });

  it("folds accents so they sort with their base letter", () => {
    const sorted = sortByName([
      { name: "Zoo" },
      { name: "Éducation" },
      { name: "Food" },
    ]);

    expect(names(sorted)).toEqual(["Éducation", "Food", "Zoo"]);
  });

  it("compares embedded numbers numerically rather than as text", () => {
    const sorted = sortByName([{ name: "Trip 10" }, { name: "Trip 2" }]);

    expect(names(sorted)).toEqual(["Trip 2", "Trip 10"]);
  });

  it("keeps equal names in their incoming order", () => {
    const sorted = sortByName([
      { id: "b", name: "Rent" },
      { id: "a", name: "rent" },
    ]);

    expect(sorted.map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("preserves every entry, including an empty list", () => {
    expect(sortByName([])).toEqual([]);
    expect(sortByName([{ name: "Only" }])).toHaveLength(1);
  });
});
