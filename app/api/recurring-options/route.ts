import { callBackend, requireSession, routeError } from "@/lib/server/backend";

/**
 * The frequencies a recurring template can be scheduled on.
 *
 * Read-only and takes no input, so there is nothing to validate — but it still
 * goes through `requireSession`, because the backend endpoint is `[Authorize]`d
 * and the call needs a bearer token like every other proxied read.
 */
export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  try {
    const result = await callBackend(
      "/v1/recurring-options",
      undefined,
      session.caller,
    );

    return result.ok ? Response.json(result.data) : result.response;
  } catch (reason) {
    return routeError("GET /api/recurring-options", reason);
  }
}
