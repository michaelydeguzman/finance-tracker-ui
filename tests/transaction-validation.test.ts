import { describe, expect, it } from "vitest";
import {
  MAX_PAGE_SIZE,
  isValidTransactionDate,
  parsePositiveIntParam,
  validateTransactionBody,
} from "@/app/api/transactions/common/utils";
import { isUuid } from "@/lib/uuid";

describe("isUuid", () => {
  it("accepts canonical UUIDs in either case", () => {
    expect(isUuid("3f2504e0-4f89-11d3-9a0c-0305e82c3301")).toBe(true);
    expect(isUuid("3F2504E0-4F89-11D3-9A0C-0305E82C3301")).toBe(true);
  });

  it("rejects path-traversal attempts and malformed ids", () => {
    expect(isUuid("../../v1/categories")).toBe(false);
    expect(isUuid("3f2504e0-4f89-11d3-9a0c-0305e82c3301/../admin")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid(42)).toBe(false);
  });
});

describe("isValidTransactionDate", () => {
  it("accepts ISO dates, ISO date-times, and Date objects", () => {
    expect(isValidTransactionDate("2026-01-31")).toBe(true);
    expect(isValidTransactionDate("2026-01-31T10:30:00Z")).toBe(true);
    expect(isValidTransactionDate(new Date("2026-01-31"))).toBe(true);
  });

  it("rejects loose input that Date would otherwise coerce", () => {
    // `new Date("5")` parses in V8, so a shape check runs before parsing.
    expect(isValidTransactionDate("5")).toBe(false);
    expect(isValidTransactionDate("last tuesday")).toBe(false);
    expect(isValidTransactionDate(new Date("nope"))).toBe(false);
    expect(isValidTransactionDate(null)).toBe(false);
  });
});

describe("parsePositiveIntParam", () => {
  it("returns the parsed number when valid", () => {
    expect(parsePositiveIntParam("3", "page")).toBe(3);
  });

  it("returns a 400 response for non-positive integers", () => {
    expect(parsePositiveIntParam("0", "page")).toBeInstanceOf(Response);
    expect(parsePositiveIntParam("-1", "page")).toBeInstanceOf(Response);
    expect(parsePositiveIntParam("1.5", "page")).toBeInstanceOf(Response);
    expect(parsePositiveIntParam("abc", "page")).toBeInstanceOf(Response);
  });

  it("enforces the page-size ceiling", () => {
    expect(
      parsePositiveIntParam(String(MAX_PAGE_SIZE), "pageSize", MAX_PAGE_SIZE),
    ).toBe(MAX_PAGE_SIZE);
    expect(
      parsePositiveIntParam(
        String(MAX_PAGE_SIZE + 1),
        "pageSize",
        MAX_PAGE_SIZE,
      ),
    ).toBeInstanceOf(Response);
  });
});

describe("validateTransactionBody", () => {
  const valid = {
    name: "Groceries",
    categoryId: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
    amount: 42.5,
    transactionDate: "2026-01-31",
    createdBy: "someone",
  };

  it("passes a complete body", () => {
    expect(validateTransactionBody(valid)).toBeNull();
  });

  it("rejects zero, negative, and non-numeric amounts", () => {
    expect(validateTransactionBody({ ...valid, amount: 0 })).toBeInstanceOf(
      Response,
    );
    expect(validateTransactionBody({ ...valid, amount: -5 })).toBeInstanceOf(
      Response,
    );
    expect(
      validateTransactionBody({ ...valid, amount: "10" as unknown as number }),
    ).toBeInstanceOf(Response);
  });

  it("rejects blank required fields", () => {
    expect(validateTransactionBody({ ...valid, name: "   " })).toBeInstanceOf(
      Response,
    );
    expect(
      validateTransactionBody({ ...valid, categoryId: "" }),
    ).toBeInstanceOf(Response);
  });

  it("accepts a body with no createdBy", () => {
    // The backend stamps it from the caller's token now, so the browser neither sends it
    // nor gets to claim one.
    const { createdBy: _ignored, ...withoutCreatedBy } = valid;

    expect(validateTransactionBody(withoutCreatedBy)).toBeNull();
  });
});
