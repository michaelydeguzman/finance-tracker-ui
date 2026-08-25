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
