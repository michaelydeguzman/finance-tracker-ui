import type { UpsertRecurringTransactionRequest } from "@/app/(app)/recurring/types/recurring.api";
import {
  callBackend,
  requireJsonContentType,
  requireSession,
  routeError,
} from "@/lib/server/backend";
import { parseRecurringStatus } from "@/lib/recurring-status";
import {
  RECURRING_INVALID_MESSAGE,
  buildNormalizedRecurringUpsertBody,
  validateRecurringBody,
} from "./common/utils";

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  try {
    const { searchParams } = new URL(request.url);

    const rawStatus = searchParams.get("status");
    const status = parseRecurringStatus(rawStatus);

    if (rawStatus !== null && status === undefined) {
      return Response.json(
        { error: "Status must be Active, Paused or Cancelled." },
        { status: 400 },
      );
    }

    // Rebuilt from the parsed value rather than passed through, so only the
    // exact enum name the API binds can reach the backend URL.
    const qs = status === undefined ? "" : `?status=${status}`;

    const result = await callBackend(
      `/v1/recurring-transactions${qs}`,
      undefined,
      session.caller,
    );

    return result.ok ? Response.json(result.data) : result.response;
  } catch (reason) {
    return routeError("GET /api/recurring-transactions", reason);
  }
}

export async function POST(request: Request) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body =
      (await request.json()) as Partial<UpsertRecurringTransactionRequest>;

    const invalid = validateRecurringBody(body);
    if (invalid) return invalid;

    const result = await callBackend(
      "/v1/recurring-transactions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNormalizedRecurringUpsertBody(body)),
      },
      session.caller,
    );

    if (result.ok) return Response.json(result.data, { status: 201 });

    // A rule only the backend can check — see RECURRING_INVALID_MESSAGE.
    if (result.response.status === 400) {
      return Response.json(
        { error: RECURRING_INVALID_MESSAGE },
        { status: 400 },
      );
    }

    return result.response;
  } catch (reason) {
    return routeError("POST /api/recurring-transactions", reason);
  }
}
