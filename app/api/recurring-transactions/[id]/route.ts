import type { UpsertRecurringTransactionRequest } from "@/app/(app)/recurring/types/recurring.api";
import { callBackend, defineRoute, requireUuid } from "@/lib/server/backend";
import {
  RECURRING_INVALID_MESSAGE,
  buildNormalizedRecurringUpsertBody,
  recurringConflictMessage,
  validateRecurringBody,
} from "../common/utils";

type Params = { id: string };

export const GET = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.id, "recurring transaction");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/recurring-transactions/${encodeURIComponent(params.id)}`,
    undefined,
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});

export const PUT = defineRoute<Params>(
  { json: true },
  async ({ request, caller, params }) => {
    const invalidId = requireUuid(params.id, "recurring transaction");
    if (invalidId) return invalidId;

    const body =
      (await request.json()) as Partial<UpsertRecurringTransactionRequest>;

    const invalid = validateRecurringBody(body);
    if (invalid) return invalid;

    const result = await callBackend(
      `/v1/recurring-transactions/${encodeURIComponent(params.id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNormalizedRecurringUpsertBody(body)),
      },
      caller,
    );

    if (result.ok) return Response.json(result.data, { status: 200 });

    // A rule only the backend can check — see RECURRING_INVALID_MESSAGE.
    if (result.response.status === 400) {
      return Response.json(
        { error: RECURRING_INVALID_MESSAGE },
        { status: 400 },
      );
    }

    // The template is cancelled. Our own wording, chosen from the status code —
    // the backend's message is logged and dropped like any other body.
    if (result.response.status === 409) {
      return Response.json(
        { error: recurringConflictMessage("update") },
        { status: 409 },
      );
    }

    return result.response;
  },
);

export const DELETE = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.id, "recurring transaction");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/recurring-transactions/${encodeURIComponent(params.id)}`,
    { method: "DELETE" },
    caller,
  );

  if (result.ok) {
    return Response.json({
      message: "Recurring transaction deleted successfully.",
    });
  }

  // The template has already generated transactions. That is the one refusal
  // the user can do something about, so it says what to do instead.
  if (result.response.status === 409) {
    return Response.json(
      { error: recurringConflictMessage("delete") },
      { status: 409 },
    );
  }

  return result.response;
});
