import { callBackend, defineRoute } from "@/lib/server/backend";

export const GET = defineRoute({}, async ({ caller }) => {
  const result = await callBackend(
    "/v1/households/invitations",
    undefined,
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});
