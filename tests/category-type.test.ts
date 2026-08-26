import { describe, expect, it } from "vitest";
import {
  coerceCategoryType,
  isCategoryType,
  parseCategoryType,
} from "@/lib/category-type";
import { CategoryType } from "@/types/shared/enums";

describe("isCategoryType", () => {
  it("accepts the numeric enum members", () => {
    expect(isCategoryType(CategoryType.Income)).toBe(true);
    expect(isCategoryType(CategoryType.Expense)).toBe(true);
  });

  it("rejects the reverse-mapped enum names", () => {
    // Regression: `Object.values()` on a numeric enum also yields "Income" and
    // "Expense", which previously let a string reach the backend.
    expect(isCategoryType("Income")).toBe(false);
    expect(isCategoryType("Expense")).toBe(false);
  });

  it("rejects out-of-range and non-numeric input", () => {
    expect(isCategoryType(2)).toBe(false);
    expect(isCategoryType(-1)).toBe(false);
    expect(isCategoryType(null)).toBe(false);
    expect(isCategoryType(undefined)).toBe(false);
    expect(isCategoryType({})).toBe(false);
  });
});

describe("parseCategoryType", () => {
  it("parses valid query values", () => {
    expect(parseCategoryType("0")).toBe(CategoryType.Income);
    expect(parseCategoryType("1")).toBe(CategoryType.Expense);
  });

  it("treats absent and blank values as unset", () => {
    expect(parseCategoryType(null)).toBeUndefined();
    // Regression: `Number("")` is 0, which used to read as Income.
    expect(parseCategoryType("")).toBeUndefined();
    expect(parseCategoryType("   ")).toBeUndefined();
  });

  it("rejects values that are not a category type", () => {
    expect(parseCategoryType("2")).toBeUndefined();
    expect(parseCategoryType("Income")).toBeUndefined();
    expect(parseCategoryType("1.5")).toBeUndefined();
  });
});

describe("coerceCategoryType", () => {
  it("accepts the names the transaction and recurring endpoints send", () => {
    expect(coerceCategoryType("Income")).toBe(CategoryType.Income);
    expect(coerceCategoryType("expense")).toBe(CategoryType.Expense);
    expect(coerceCategoryType("  Expense  ")).toBe(CategoryType.Expense);
  });

  it("accepts the numbers the category endpoint sends", () => {
    expect(coerceCategoryType(0)).toBe(CategoryType.Income);
    expect(coerceCategoryType("1")).toBe(CategoryType.Expense);
  });

  it("surfaces anything unrecognized as NaN rather than reading as Income", () => {
    // `Number("Savings")` is NaN, which fails every comparison. Defaulting to 0
    // would file an unknown type under Income and quietly skew the dashboard.
    expect(coerceCategoryType("Savings")).toBeNaN();
    expect(coerceCategoryType(undefined)).toBeNaN();
  });
});
