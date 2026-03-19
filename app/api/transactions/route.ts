import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import { CategoryType } from "@/types/shared/enums";

const API_URL = process.env.API_URL;

const isValidTransactionDate = (value: unknown): value is string | Date => {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string") {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
};

const isValidCategoryType = (value: unknown): value is CategoryType =>
  Object.values(CategoryType).includes(value as CategoryType);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type !== null && !isValidCategoryType(Number(type))) {
      return Response.json(
        { error: "Category type must be income or expense." },
        { status: 400 },
      );
    }

    const backendUrl =
      type !== null
        ? `${API_URL}/v1/transactions?type=${type}`
        : `${API_URL}/v1/transactions`;

    const response = await fetch(backendUrl);

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  try {
    const body = (await request.json()) as Partial<UpsertTransactionRequest>;

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
      return Response.json(
        { error: "Created by is required." },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_URL}/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 201 });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
