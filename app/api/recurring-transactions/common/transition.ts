import {
  callBackend,
  isUuid,
  requireSession,
  routeError,
} from "@/lib/server/backend";
import type { RecurringTransition } from "@/lib/recurring-status";
import { recurringConflictMessage } from "./utils";

/**
 * Shared body of the pause / resume / cancel handlers.
 *
 * The three transitions are separate route files rather than one `[action]`
 * segment: the path is then a literal in every case, so no part of a request
 * can steer which backend endpoint is called.
 */
export async function runRecurringTransition(
  request: Request,
  context: { params: Promise<{ id: string }> },
  transition: RecurringTransition,
): Promise<Response> {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  try {
    const { id } = await context.params;

    if (!isUuid(id)) {
      return Response.json(
        { error: "A valid recurring transaction id is required." },
        { status: 400 },
      );
    }

    const result = await callBackend(
      `/v1/recurring-transactions/${encodeURIComponent(id)}/${transition}`,
      { method: "POST" },
      session.caller,
    );

    if (result.ok) return Response.json(result.data);

    // Our own wording per transition, picked from the status code alone. The
    // backend's message is logged server-side and never forwarded.
    if (result.response.status === 409) {
      return Response.json(
        { error: recurringConflictMessage(transition) },
        { status: 409 },
      );
    }

    return result.response;
  } catch (reason) {
    return routeError(
      `POST /api/recurring-transactions/[id]/${transition}`,
      reason,
    );
  }
}
