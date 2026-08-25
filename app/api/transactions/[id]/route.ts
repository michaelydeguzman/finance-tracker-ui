import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import {
  callBackend,
  isUuid,
  requireJsonContentType,
  requireSession,
  routeError,
} from "@/lib/server/backend";
import {
  buildNormalizedTransactionUpsertBody,
  validateTransactionBody,
} from "../common/utils";

const invalidId = () =>
  Response.json(
    { error: "A valid transaction id is required." },
    { status: 400 },
  );

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    if (!isUuid(id)) return invalidId();

    const result = await callBackend(
      `/v1/transactions/${encodeURIComponent(id)}`,
    );

    return result.ok ? Response.json(result.data) : result.response;
  } catch (reason) {
    return routeError("GET /api/transactions/[id]", reason);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const { id } = await context.params;
    if (!isUuid(id)) return invalidId();

    const body = (await request.json()) as Partial<UpsertTransactionRequest>;

    const invalid = validateTransactionBody(body);
    if (invalid) return invalid;

    const result = await callBackend(
      `/v1/transactions/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNormalizedTransactionUpsertBody(body)),
      },
    );

    return result.ok
      ? Response.json(result.data, { status: 200 })
      : result.response;
  } catch (reason) {
    return routeError("PUT /api/transactions/[id]", reason);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    if (!isUuid(id)) return invalidId();

    const result = await callBackend(
      `/v1/transactions/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    return result.ok
      ? Response.json({ message: "Transaction deleted successfully." })
      : result.response;
  } catch (reason) {
    return routeError("DELETE /api/transactions/[id]", reason);
  }
}
