import type { InviteMemberRequest } from "@/types/household.api";
import { callBackend, defineRoute } from "@/lib/server/backend";
import { validateInvitedEmail } from "@/lib/household";

export const POST = defineRoute({ json: true }, async ({ request, caller }) => {
  const body = (await request.json()) as Partial<InviteMemberRequest>;
  const email = validateInvitedEmail(body?.email);

  if (!email.ok) {
    return Response.json({ error: email.error }, { status: 400 });
  }

  const result = await callBackend(
    "/v1/households/me/invitations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value }),
    },
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});
