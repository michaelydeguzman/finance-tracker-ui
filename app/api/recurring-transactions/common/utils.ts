import type { UpsertRecurringTransactionRequest } from "@/app/(app)/recurring/types/recurring.api";
import { isIsoDateLike, toIsoString } from "@/lib/iso-date";
import { isUuid } from "@/lib/uuid";
import type { RecurringTransition } from "@/lib/recurring-status";

/** Matches the API's `[MaxLength]` attributes, so an over-long field fails here. */
export const MAX_NAME_LENGTH = 250;
export const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Normalized JSON body for POST/PUT to the backend — explicit fields only, in
 * the shape `CreateRecurringTransactionDto` / `UpdateRecurringTransactionDto`
 * declare.
 *
 * Neither `status` nor `createdBy` is sent: a template is always created active,
 * status only moves through the transition endpoints, and the author comes from
 * the caller's token.
 */
export function buildNormalizedRecurringUpsertBody(
  body: Partial<UpsertRecurringTransactionRequest>,
): {
  name: string;
  description: string | null;
  amount: number;
  categoryId: string;
  frequencyId: string;
  startDate: string;
  endDate: string | null;
} {
  return {
    name: body.name!.trim(),
    description:
      body.description == null || String(body.description).trim() === ""
        ? null
        : String(body.description).trim(),
    amount: Number(body.amount),
    categoryId: body.categoryId!.trim(),
    frequencyId: body.frequencyId!.trim(),
    startDate: toIsoString(body.startDate!),
    endDate:
      body.endDate === undefined || body.endDate === null || body.endDate === ""
        ? null
        : toIsoString(body.endDate),
  };
}

/** Shared body validation for recurring create/update. */
export function validateRecurringBody(
  body: Partial<UpsertRecurringTransactionRequest>,
): Response | null {
  const name = body?.name?.trim();

  if (!name) {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  if (name.length > MAX_NAME_LENGTH) {
    return Response.json(
      { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  if (
    body?.description != null &&
    String(body.description).trim().length > MAX_DESCRIPTION_LENGTH
  ) {
    return Response.json(
      {
        error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
      },
      { status: 400 },
    );
  }

  // Both ids reach a backend URL only as part of the JSON body, but they are
  // still checked: an id that is not a UUID cannot match anything, and failing
  // here costs one round trip less than finding out downstream.
  if (!isUuid(body?.categoryId?.trim())) {
    return Response.json(
      { error: "A valid category id is required." },
      { status: 400 },
    );
  }

  if (!isUuid(body?.frequencyId?.trim())) {
    return Response.json(
      { error: "A valid frequency id is required." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(body?.amount) || Number(body.amount) <= 0) {
    return Response.json(
      { error: "Amount must be greater than zero." },
      { status: 400 },
    );
  }

  if (!isIsoDateLike(body?.startDate)) {
    return Response.json({ error: "Start date is invalid." }, { status: 400 });
  }

  if (body?.endDate != null && body.endDate !== "") {
    if (!isIsoDateLike(body.endDate)) {
      return Response.json({ error: "End date is invalid." }, { status: 400 });
    }

    if (
      new Date(toIsoString(body.endDate)).getTime() <
      new Date(toIsoString(body.startDate)).getTime()
    ) {
      return Response.json(
        { error: "End date cannot be earlier than the start date." },
        { status: 400 },
      );
    }
  }

  return null;
}

/** The operations that can come back a 409, each for its own reason. */
export type RecurringConflictSource = RecurringTransition | "update" | "delete";

/**
 * What to tell the browser when the backend says 409.
 *
 * Written here rather than forwarded: the backend's own message is logged and
 * dropped like every other backend body, and a bare "that conflicts with an
 * existing record" leaves someone staring at a button that just refused. The
 * status code plus the operation is enough to say something actionable, and
 * none of it comes from the backend's response.
 */
export function recurringConflictMessage(
  source: RecurringConflictSource,
): string {
  switch (source) {
    case "delete":
      return "This recurring transaction has already generated transactions, so it cannot be deleted. Cancel it instead — that stops it generating and keeps their history.";
    case "resume":
      return "This recurring transaction cannot be resumed. A cancelled template is final, and one whose end date has passed has nothing left to generate.";
    case "update":
      return "A cancelled recurring transaction cannot be edited. Create a new one instead.";
    case "pause":
      return "A cancelled recurring transaction cannot be paused.";
    case "cancel":
      return "This recurring transaction could not be cancelled.";
  }
}
