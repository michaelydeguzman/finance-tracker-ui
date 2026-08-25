import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/currency";

describe("formatCurrency", () => {
  it("puts the symbol in front and the currency code after", () => {
    expect(formatCurrency(2993.22)).toBe("$2,993.22 CAD");
  });

  it("pads a whole amount to two decimals", () => {
    expect(formatCurrency(2736)).toBe("$2,736.00 CAD");
  });

  it("keeps sub-dollar amounts readable", () => {
    expect(formatCurrency(0.94)).toBe("$0.94 CAD");
  });

  it("keeps the minus sign outside the symbol for negative savings", () => {
    expect(formatCurrency(-1204.5)).toBe("-$1,204.50 CAD");
  });

  it("groups thousands in large figures", () => {
    expect(formatCurrency(1234567.891)).toBe("$1,234,567.89 CAD");
  });

  it("falls back to zero rather than rendering NaN", () => {
    expect(formatCurrency(Number.NaN)).toBe("$0.00 CAD");
  });

  it("falls back to zero for infinite input", () => {
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("$0.00 CAD");
  });
});
