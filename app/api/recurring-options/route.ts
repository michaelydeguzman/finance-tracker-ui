import { callBackend, defineRoute } from "@/lib/server/backend";

/**
 * The frequencies a recurring template can be scheduled on.
 *
 * Read-only and takes no input, so there is nothing to validate — but it is still
 * a session-gated route, because the backend endpoint is `[Authorize]`d and the
 * call needs a bearer token like every other proxied read.
 */
export const GET = defineRoute({}, async ({ caller }) => {
  const result = await callBackend("/v1/recurring-options", undefined, caller);

  return result.ok ? Response.json(result.data) : result.response;
});
