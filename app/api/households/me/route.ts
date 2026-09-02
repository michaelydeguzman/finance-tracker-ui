import type { CreateHouseholdRequest } from "@/app/(app)/households/types/household.api";
import { callBackend, defineRoute } from "@/lib/server/backend";
import { validateHouseholdName } from "@/lib/household";

export const GET = defineRoute({}, async ({ caller }) => {
  const result = await callBackend("/v1/households/me", undefined, caller);

  return result.ok ? Response.json(result.data) : result.response;
});

export const PUT = defineRoute({ json: true }, async ({ request, caller }) => {
  const body = (await request.json()) as Partial<CreateHouseholdRequest>;
  const name = validateHouseholdName(body?.name);

  if (!name.ok) {
    return Response.json({ error: name.error }, { status: 400 });
  }

  const result = await callBackend(
    "/v1/households/me",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.value }),
    },
    caller,
  );

  return result.ok ? Response.json(result.data) : result.response;
});
