import { callBackend, defineRoute } from "@/lib/server/backend";

export const POST = defineRoute({}, async ({ caller }) => {
  const result = await callBackend(
    "/v1/households/me/leave",
    { method: "POST" },
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});
