import type { UpsertRecurringTransactionRequest } from "@/app/(app)/recurring/types/recurring.api";
import {
  callBackend,
  isUuid,
  requireJsonContentType,
  requireSession,
  routeError,
} from "@/lib/server/backend";
import {
  RECURRING_INVALID_MESSAGE,
  buildNormalizedRecurringUpsertBody,
  recurringConflictMessage,
  validateRecurringBody,
} from "../common/utils";

const invalidId = () =>
  Response.json(
    { error: "A valid recurring transaction id is required." },
    { status: 400 },
  );

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  try {
    const { id } = await context.params;
    if (!isUuid(id)) return invalidId();

    const result = await callBackend(
      `/v1/recurring-transactions/${encodeURIComponent(id)}`,
      undefined,
      session.caller,
    );

    return result.ok ? Response.json(result.data) : result.response;
  } catch (reason) {
    return routeError("GET /api/recurring-transactions/[id]", reason);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const { id } = await context.params;
    if (!isUuid(id)) return invalidId();

    const body =
      (await request.json()) as Partial<UpsertRecurringTransactionRequest>;

    const invalid = validateRecurringBody(body);
    if (invalid) return invalid;

    const result = await callBackend(
      `/v1/recurring-transactions/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNormalizedRecurringUpsertBody(body)),
      },
      session.caller,
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
  } catch (reason) {
    return routeError("PUT /api/recurring-transactions/[id]", reason);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  try {
    const { id } = await context.params;
    if (!isUuid(id)) return invalidId();

    const result = await callBackend(
      `/v1/recurring-transactions/${encodeURIComponent(id)}`,
      { method: "DELETE" },
      session.caller,
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
  } catch (reason) {
    return routeError("DELETE /api/recurring-transactions/[id]", reason);
  }
}
