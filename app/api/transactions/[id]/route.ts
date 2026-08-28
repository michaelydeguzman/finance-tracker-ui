import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import { callBackend, defineRoute, requireUuid } from "@/lib/server/backend";
import {
  buildNormalizedTransactionUpsertBody,
  validateTransactionBody,
} from "../common/utils";

type Params = { id: string };

export const GET = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.id, "transaction");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/transactions/${encodeURIComponent(params.id)}`,
    undefined,
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});

export const PUT = defineRoute<Params>(
  { json: true },
  async ({ request, caller, params }) => {
    const invalidId = requireUuid(params.id, "transaction");
    if (invalidId) return invalidId;

    const body = (await request.json()) as Partial<UpsertTransactionRequest>;

    const invalid = validateTransactionBody(body);
    if (invalid) return invalid;

    const result = await callBackend(
      `/v1/transactions/${encodeURIComponent(params.id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNormalizedTransactionUpsertBody(body)),
      },
      caller,
    );

    return result.ok
      ? Response.json(result.data, { status: 200 })
      : result.response;
  },
);

export const DELETE = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.id, "transaction");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/transactions/${encodeURIComponent(params.id)}`,
    { method: "DELETE" },
    caller,
  );

  return result.ok
    ? Response.json({ message: "Transaction deleted successfully." })
    : result.response;
});
