import { callBackend, defineRoute, requireUuid } from "@/lib/server/backend";

type Params = { invitationId: string };

export const DELETE = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.invitationId, "invitation");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/households/me/invitations/${encodeURIComponent(params.invitationId)}`,
    { method: "DELETE" },
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});
