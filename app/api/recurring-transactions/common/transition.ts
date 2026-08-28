import { callBackend, defineRoute, requireUuid } from "@/lib/server/backend";
import type { RecurringTransition } from "@/lib/recurring-status";
import { recurringConflictMessage } from "./utils";

/**
 * Builds the pause / resume / cancel handler, which differ only in that word.
 *
 * The three transitions are separate route files rather than one `[action]`
 * segment: the path is then a literal in every case, so no part of a request
 * can steer which backend endpoint is called.
 */
export function recurringTransitionRoute(transition: RecurringTransition) {
  return defineRoute<{ id: string }>({}, async ({ caller, params }) => {
    const invalidId = requireUuid(params.id, "recurring transaction");
    if (invalidId) return invalidId;

    const result = await callBackend(
      `/v1/recurring-transactions/${encodeURIComponent(params.id)}/${transition}`,
      { method: "POST" },
      caller,
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
  });
}
