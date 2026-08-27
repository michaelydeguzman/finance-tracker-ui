import { describe, expect, it } from "vitest";
import {
  buildNormalizedRecurringUpsertBody,
  recurringConflictMessage,
  validateRecurringBody,
} from "@/app/api/recurring-transactions/common/utils";
import { validateRecurringForm } from "@/app/(app)/recurring/data/recurring-form";
import { recurringListUrl } from "@/lib/api/endpoints/recurring";
import { isIsoDateLike, toIsoString } from "@/lib/iso-date";

const CATEGORY_ID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";
const FREQUENCY_ID = "9c858901-8a57-4791-81fe-4c455b099bc9";

const body = (overrides: Record<string, unknown> = {}) => ({
  name: "Rent",
  amount: 1200,
  categoryId: CATEGORY_ID,
  frequencyId: FREQUENCY_ID,
  startDate: "2026-09-01",
  ...overrides,
});

const errorOf = async (response: Response): Promise<string> => {
  const parsed = (await response.json()) as { error?: string };
  return parsed.error ?? "";
};

describe("validateRecurringBody", () => {
  it("accepts a well-formed template", () => {
    expect(validateRecurringBody(body())).toBeNull();
    expect(validateRecurringBody(body({ endDate: "2027-09-01" }))).toBeNull();
    expect(validateRecurringBody(body({ endDate: null }))).toBeNull();
  });

  it("requires a name within the API's length limit", async () => {
    expect(validateRecurringBody(body({ name: "   " }))).toBeInstanceOf(
      Response,
    );

    const tooLong = validateRecurringBody(body({ name: "x".repeat(251) }));
    expect(tooLong).toBeInstanceOf(Response);
    expect((tooLong as Response).status).toBe(400);
    expect(await errorOf(tooLong as Response)).toContain("250");
  });

  it("rejects ids that are not UUIDs, before they reach a backend URL", () => {
    expect(
      validateRecurringBody(body({ categoryId: "../../v1/categories" })),
    ).toBeInstanceOf(Response);
    expect(
      validateRecurringBody(body({ frequencyId: "not-a-uuid" })),
    ).toBeInstanceOf(Response);
    expect(validateRecurringBody(body({ categoryId: "" }))).toBeInstanceOf(
      Response,
    );
  });

  it("rejects a non-positive or non-numeric amount", () => {
    expect(validateRecurringBody(body({ amount: 0 }))).toBeInstanceOf(Response);
    expect(validateRecurringBody(body({ amount: -5 }))).toBeInstanceOf(
      Response,
    );
    expect(validateRecurringBody(body({ amount: "lots" }))).toBeInstanceOf(
      Response,
    );
  });

  it("rejects dates that only look like dates", () => {
    expect(validateRecurringBody(body({ startDate: "5" }))).toBeInstanceOf(
      Response,
    );
    expect(
      validateRecurringBody(body({ startDate: "next tuesday" })),
    ).toBeInstanceOf(Response);
    expect(validateRecurringBody(body({ endDate: "whenever" }))).toBeInstanceOf(
      Response,
    );
  });

  it("rejects an end date before the start date", async () => {
    const invalid = validateRecurringBody(
      body({ startDate: "2026-09-01", endDate: "2026-08-01" }),
    );

    expect(invalid).toBeInstanceOf(Response);
    expect(await errorOf(invalid as Response)).toContain("earlier");
  });

  it("allows an end date equal to the start date", () => {
    expect(
      validateRecurringBody(
        body({ startDate: "2026-09-01", endDate: "2026-09-01" }),
      ),
    ).toBeNull();
  });
});

describe("buildNormalizedRecurringUpsertBody", () => {
  it("sends only the fields the API's DTO declares", () => {
    const normalized = buildNormalizedRecurringUpsertBody(
      body({
        name: "  Rent  ",
        description: "  Flat  ",
        endDate: "2027-09-01",
        // Neither of these exists on the create/update DTO: status only moves
        // through the transition endpoints, and the author comes from the token.
        status: "Cancelled",
        createdBy: "someone-else@example.com",
      }),
    );

    expect(normalized).toEqual({
      name: "Rent",
      description: "Flat",
      amount: 1200,
      categoryId: CATEGORY_ID,
      frequencyId: FREQUENCY_ID,
      startDate: toIsoString("2026-09-01"),
      endDate: toIsoString("2027-09-01"),
    });
    expect(Object.keys(normalized)).not.toContain("status");
    expect(Object.keys(normalized)).not.toContain("createdBy");
  });

  it("normalizes an absent, null or blank optional field to null", () => {
    expect(buildNormalizedRecurringUpsertBody(body()).description).toBeNull();
    expect(
      buildNormalizedRecurringUpsertBody(body({ description: "   " }))
        .description,
    ).toBeNull();
    expect(buildNormalizedRecurringUpsertBody(body()).endDate).toBeNull();
    expect(
      buildNormalizedRecurringUpsertBody(body({ endDate: "" })).endDate,
    ).toBeNull();
  });

  it("accepts a Date as well as a string, like the transaction routes do", () => {
    const startDate = new Date("2026-09-01T00:00:00.000Z");

    expect(
      buildNormalizedRecurringUpsertBody(body({ startDate })).startDate,
    ).toBe("2026-09-01T00:00:00.000Z");
  });
});

describe("recurringConflictMessage", () => {
  it("tells someone to cancel a template that cannot be deleted", () => {
    // The 409 the API raises when a template has already generated
    // transactions. The backend's own body is never forwarded, so this wording
    // is what makes the refusal actionable.
    expect(recurringConflictMessage("delete")).toMatch(/cancel it instead/i);
    expect(recurringConflictMessage("delete")).toMatch(/history/i);
  });

  it("explains both reasons a resume can be refused", () => {
    expect(recurringConflictMessage("resume")).toMatch(/cancelled/i);
    expect(recurringConflictMessage("resume")).toMatch(/end date/i);
  });

  it("explains that a cancelled template cannot be edited", () => {
    expect(recurringConflictMessage("update")).toMatch(/create a new one/i);
  });

  it("never says anything as unhelpful as the generic conflict message", () => {
    for (const source of [
      "pause",
      "resume",
      "cancel",
      "update",
      "delete",
    ] as const) {
      expect(recurringConflictMessage(source)).not.toBe(
        "That change conflicts with an existing record.",
      );
      expect(recurringConflictMessage(source).length).toBeGreaterThan(20);
    }
  });
});

describe("validateRecurringForm", () => {
  const values = (overrides: Partial<Record<string, string>> = {}) => ({
    name: "Rent",
    categoryId: CATEGORY_ID,
    frequencyId: FREQUENCY_ID,
    amount: "1200",
    startDate: "2026-09-01",
    endDate: "",
    ...overrides,
  });

  it("passes a complete form", () => {
    expect(validateRecurringForm(values())).toBeNull();
    expect(validateRecurringForm(values({ endDate: "2027-01-01" }))).toBeNull();
  });

  it("names the field that is wrong, so the dialog can say something specific", () => {
    expect(validateRecurringForm(values({ name: "  " }))?.field).toBe("name");
    expect(validateRecurringForm(values({ categoryId: "" }))?.field).toBe(
      "categoryId",
    );
    expect(validateRecurringForm(values({ frequencyId: "" }))?.field).toBe(
      "frequencyId",
    );
    expect(validateRecurringForm(values({ amount: "" }))?.field).toBe("amount");
    expect(validateRecurringForm(values({ startDate: "" }))?.field).toBe(
      "startDate",
    );
  });

  it("enforces the API's minimum amount rather than merely 'greater than zero'", () => {
    // `[Range(0.01, …)]` — 0.005 would come back a 400 the user cannot read.
    expect(validateRecurringForm(values({ amount: "0.005" }))?.field).toBe(
      "amount",
    );
    expect(validateRecurringForm(values({ amount: "0.01" }))).toBeNull();
  });

  it("rejects an end date before the start date", () => {
    const error = validateRecurringForm(
      values({ startDate: "2026-09-01", endDate: "2026-08-31" }),
    );

    expect(error?.field).toBe("endDate");
    expect(error?.message).toMatch(/earlier/i);
  });
});

describe("recurringListUrl", () => {
  it("omits the query entirely when no status is asked for", () => {
    expect(recurringListUrl()).toBe("/api/recurring-transactions");
  });

  it("passes the status through as the API's enum name", () => {
    expect(recurringListUrl("Paused")).toBe(
      "/api/recurring-transactions?status=Paused",
    );
  });
});

describe("isIsoDateLike", () => {
  it("still backs the transaction routes' date check after the move to lib", () => {
    expect(isIsoDateLike("2026-01-31")).toBe(true);
    expect(isIsoDateLike("2026-01-31T10:30:00Z")).toBe(true);
    expect(isIsoDateLike("5")).toBe(false);
    expect(isIsoDateLike(new Date("nope"))).toBe(false);
  });
});
