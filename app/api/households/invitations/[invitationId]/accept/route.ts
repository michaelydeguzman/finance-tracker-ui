import { ONE_HOUSEHOLD_CONFLICT } from "@/lib/household";
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

  if (result.ok) {
    return Response.json(result.data);
  }

  // Same rule from the other direction. The API's 409 here also covers an invitation that
  // has expired or been withdrawn, so the message names the likeliest cause without
  // claiming to know which — see the accept handler's own conflict cases.
  return result.response.status === 409
    ? Response.json(
        {
          error: `${ONE_HOUSEHOLD_CONFLICT.join} If you are not, that invitation is no longer valid.`,
        },
        { status: 409 },
      )
    : result.response;
});
