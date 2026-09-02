import { callBackend, defineRoute, requireUuid } from "@/lib/server/backend";

type Params = { invitationId: string };

export const POST = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.invitationId, "invitation");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/households/invitations/${encodeURIComponent(params.invitationId)}/accept`,
    { method: "POST" },
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});
