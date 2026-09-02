import { callBackend, defineRoute, requireUuid } from "@/lib/server/backend";

type Params = { memberId: string };

export const DELETE = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.memberId, "member");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/households/me/members/${encodeURIComponent(params.memberId)}`,
    { method: "DELETE" },
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});
