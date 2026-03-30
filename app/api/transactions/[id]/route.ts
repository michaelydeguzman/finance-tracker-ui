import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import {
  buildNormalizedTransactionUpsertBody,
  isValidTransactionDate,
} from "../common/utils";

const API_URL = process.env.API_URL;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return Response.json({ error: "Id is required." }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/v1/transactions/${id}`);

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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return Response.json({ error: "Id is required." }, { status: 400 });
    }

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

    const normalized = buildNormalizedTransactionUpsertBody(body);

    const response = await fetch(`${API_URL}/v1/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return Response.json({ error: "Id is required." }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/v1/transactions/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    return Response.json(
      { message: "Transaction deleted successfully." },
      { status: 200 },
    );
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
