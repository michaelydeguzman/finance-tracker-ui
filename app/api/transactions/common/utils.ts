import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import { CategoryType } from "@/types/shared/enums";

/** UUID string (8-4-4-4-12 hex), case-insensitive. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidString(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Parses a required positive integer query param, or returns a 400 Response.
 */
export function parsePositiveIntParam(
  raw: string,
  name: string,
): number | Response {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    return Response.json(
      { error: `${name} must be a positive integer.` },
      { status: 400 },
    );
  }
  return n;
}

export type BackendTransactionListParamsInput = {
  categoryType: number | null;
  from: string | null;
  to: string | null;
  /** Each id forwarded as its own `categoryIds` key (ASP.NET model binding). */
  categoryIds: string[];
  page: number | null;
  pageSize: number | null;
};

export function buildBackendTransactionListSearchParams(
  input: BackendTransactionListParamsInput,
): URLSearchParams {
  const params = new URLSearchParams();
  if (input.categoryType !== null) {
    params.set("categoryType", String(input.categoryType));
  }
  if (input.from !== null && input.to !== null) {
    params.set("from", input.from);
    params.set("to", input.to);
  }
  for (const id of input.categoryIds) {
    params.append("categoryIds", id);
  }
  if (input.page !== null && input.pageSize !== null) {
    params.set("page", String(input.page));
    params.set("pageSize", String(input.pageSize));
  }
  return params;
}

export function isValidTransactionDate(value: unknown): value is string | Date {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string") {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function isValidCategoryTypeValue(value: number): value is CategoryType {
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
