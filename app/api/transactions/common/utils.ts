import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import type { CategoryType } from "@/types/shared/enums";

/** Upper bound so a caller cannot ask the backend for an unbounded page. */
export const MAX_PAGE_SIZE = 200;

/**
 * Parses a required positive integer query param, or returns a 400 Response.
 */
export function parsePositiveIntParam(
  raw: string,
  name: string,
  max?: number,
): number | Response {
  const n = Number(raw);

  if (!Number.isInteger(n) || n < 1) {
    return Response.json(
      { error: `${name} must be a positive integer.` },
      { status: 400 },
    );
  }

  if (max !== undefined && n > max) {
    return Response.json(
      { error: `${name} must be ${max} or less.` },
      { status: 400 },
    );
  }

  return n;
}

export type BackendTransactionListParamsInput = {
  categoryType: CategoryType | undefined;
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

  if (input.categoryType !== undefined) {
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

/**
 * Accepts a `Date` or an ISO-8601 date / date-time string.
 *
 * The shape is checked before parsing because `new Date()` accepts a lot of
 * loose input — `new Date("5")` is a valid date in V8 — which would send
 * nonsense through to the backend.
 */
const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export function isValidTransactionDate(value: unknown): value is string | Date {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string" || !ISO_DATE_RE.test(value.trim())) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
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
      : new Date(rawDate).toISOString();

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

/** Shared body validation for transaction create/update. */
export function validateTransactionBody(
  body: Partial<UpsertTransactionRequest>,
): Response | null {
  if (!body?.name?.trim()) {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  if (!body?.categoryId?.trim()) {
    return Response.json(
      { error: "Category id is required." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(body?.amount) || Number(body.amount) <= 0) {
    return Response.json(
      { error: "Amount must be greater than zero." },
      { status: 400 },
    );
  }

  if (!isValidTransactionDate(body?.transactionDate)) {
    return Response.json(
      { error: "Transaction date is invalid." },
      { status: 400 },
    );
  }

  if (!body?.createdBy?.trim()) {
    return Response.json({ error: "Created by is required." }, { status: 400 });
  }

  return null;
}
