import { describe, expect, it } from "vitest";
import { formatTransactionAmount } from "@/lib/currency";

describe("formatTransactionAmount", () => {
  it("puts the symbol in front and the currency code after", () => {
    expect(formatTransactionAmount(2993.22)).toBe("$2,993.22 CAD");
  });

  it("pads a whole amount to two decimals", () => {
    expect(formatTransactionAmount(2736)).toBe("$2,736.00 CAD");
  });

  it("keeps sub-dollar amounts readable", () => {
    expect(formatTransactionAmount(0.94)).toBe("$0.94 CAD");
  });

  it("falls back to zero rather than rendering NaN", () => {
    expect(formatTransactionAmount(Number.NaN)).toBe("$0.00 CAD");
  });
});
