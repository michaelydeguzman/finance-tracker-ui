import type { CreateHouseholdRequest } from "@/types/household.api";
import { callBackend, defineRoute } from "@/lib/server/backend";
import { ONE_HOUSEHOLD_CONFLICT, validateHouseholdName } from "@/lib/household";

export const POST = defineRoute({ json: true }, async ({ request, caller }) => {
  const body = (await request.json()) as Partial<CreateHouseholdRequest>;
  const name = validateHouseholdName(body?.name);

  if (!name.ok) {
    return Response.json({ error: name.error }, { status: 400 });
  }

  const result = await callBackend(
    "/v1/households",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.value }),
    },
    caller,
  );

  if (result.ok) {
    return Response.json(result.data, { status: 201 });
  }

  // The API allows one household per person and answers 409. `callBackend` replaces every
  // backend body with a generic line, so without this the browser reports "that change
  // conflicts with an existing record" for a situation with an obvious fix. The wording is
  // ours, not the backend's — nothing is forwarded.
  return result.response.status === 409
    ? Response.json({ error: ONE_HOUSEHOLD_CONFLICT.create }, { status: 409 })
    : result.response;
});
