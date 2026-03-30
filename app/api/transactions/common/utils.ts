import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import { CategoryType } from "@/types/shared/enums";

export function isValidTransactionDate(
  value: unknown,
): value is string | Date {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string") {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function isValidCategoryTypeValue(
  value: number,
): value is CategoryType {
  return Object.values(CategoryType).includes(value as CategoryType);
}

/**
 * Normalized JSON body for POST/PUT to the backend — explicit fields only
 * (mirrors category routes that send trimmed, known keys).
 */
export function buildNormalizedTransactionUpsertBody(
  body: Partial<UpsertTransactionRequest>,
): {
  name: string;
  categoryId: string;
  description: string | null;
  amount: number;
  frequencyId: string | null;
  transactionDate: string;
  createdBy: string;
} {
  const rawDate = body.transactionDate!;
  const transactionDate =
    rawDate instanceof Date
      ? rawDate.toISOString()
      : new Date(rawDate as string).toISOString();

  return {
    name: body.name!.trim(),
    categoryId: body.categoryId!.trim(),
    description:
      body.description == null || body.description === ""
        ? null
        : String(body.description).trim(),
    amount: Number(body.amount),
    frequencyId: body.frequencyId ?? null,
    transactionDate,
    createdBy: body.createdBy!.trim(),
  };
}
