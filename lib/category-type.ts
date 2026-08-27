import { CategoryType } from "@/types/shared/enums";

/**
 * Narrows unknown input to a `CategoryType`.
 *
 * Deliberately checks the numeric members rather than `Object.values()`:
 * numeric TypeScript enums carry a reverse mapping, so `Object.values` also
 * yields `"Income"` and `"Expense"`, which would let a string past validation
 * and on to a backend that expects an int.
 */
export const isCategoryType = (value: unknown): value is CategoryType =>
  value === CategoryType.Income || value === CategoryType.Expense;

/** Parses a query-string category type. Returns `undefined` when invalid. */
export function parseCategoryType(
  raw: string | null,
): CategoryType | undefined {
  if (raw === null || raw.trim() === "") {
    return undefined;
  }

  const parsed = Number(raw);
  return isCategoryType(parsed) ? parsed : undefined;
}

/**
 * Coerces whatever the API sent into a `CategoryType`.
 *
 * Transactions and recurring templates both serialize `categoryType` as a name
 * ("Income" / "Expense") while categories serialize it as a number, so the
 * client mappers have to accept either. Anything unrecognized is passed through
 * `Number`, which surfaces as `NaN` rather than silently reading as Income.
 */
export function coerceCategoryType(raw: unknown): CategoryType {
  if (typeof raw === "string") {
    const name = raw.trim().toLowerCase();
    if (name === "income") return CategoryType.Income;
    if (name === "expense") return CategoryType.Expense;
  }

  return Number(raw) as CategoryType;
}
