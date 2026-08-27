import { describe, expect, it } from "vitest";
import {
  RECURRING_STATUSES,
  RECURRING_TRANSITIONS,
  availableActions,
  isActionAvailable,
  isRecurringStatus,
  isRecurringTransition,
  parseRecurringStatus,
  type RecurringAction,
  type RecurringStatus,
} from "@/lib/recurring-status";

describe("parseRecurringStatus", () => {
  it("accepts the API's enum names in any casing and returns the canonical one", () => {
    expect(parseRecurringStatus("Active")).toBe("Active");
    expect(parseRecurringStatus("paused")).toBe("Paused");
    expect(parseRecurringStatus("  CANCELLED  ")).toBe("Cancelled");
  });

  it("treats absent and blank values as no filter", () => {
    expect(parseRecurringStatus(null)).toBeUndefined();
    expect(parseRecurringStatus("")).toBeUndefined();
    expect(parseRecurringStatus("   ")).toBeUndefined();
  });

  it("rejects anything that is not a status", () => {
    // The numeric form is deliberately not accepted: `status` is a string on
    // this contract, and "0" would otherwise be forwarded as a filter.
    expect(parseRecurringStatus("0")).toBeUndefined();
    expect(parseRecurringStatus("Archived")).toBeUndefined();
    expect(parseRecurringStatus("Active; DROP")).toBeUndefined();
  });
});

describe("isRecurringStatus", () => {
  it("narrows only exact status names", () => {
    expect(isRecurringStatus("Active")).toBe(true);
    expect(isRecurringStatus("active")).toBe(false);
    expect(isRecurringStatus(0)).toBe(false);
    expect(isRecurringStatus(null)).toBe(false);
  });
});

describe("isRecurringTransition", () => {
  it("accepts only the three transition endpoints", () => {
    expect(RECURRING_TRANSITIONS).toEqual(["pause", "resume", "cancel"]);
    expect(isRecurringTransition("resume")).toBe(true);
    expect(isRecurringTransition("delete")).toBe(false);
    expect(isRecurringTransition("../cancel")).toBe(false);
  });
});

describe("availableActions", () => {
  // The table the UI is built from. Each row mirrors a rule the API enforces,
  // so a change here is a change to what the API accepts.
  const expected: Record<RecurringStatus, RecurringAction[]> = {
    Active: ["edit", "pause", "cancel", "delete"],
    Paused: ["edit", "resume", "cancel", "delete"],
    Cancelled: ["delete"],
  };

  for (const status of RECURRING_STATUSES) {
    it(`offers exactly the ${status} actions`, () => {
      expect([...availableActions(status)]).toEqual(expected[status]);
    });
  }

  it("never offers to edit, pause or resume a cancelled template", () => {
    // The API answers 409 for all three — cancelling is terminal.
    expect(isActionAvailable("Cancelled", "edit")).toBe(false);
    expect(isActionAvailable("Cancelled", "pause")).toBe(false);
    expect(isActionAvailable("Cancelled", "resume")).toBe(false);
    expect(isActionAvailable("Cancelled", "cancel")).toBe(false);
  });

  it("keeps delete available in every state", () => {
    // Whether it succeeds depends on generated transactions, which the list
    // cannot see, so the 409 is explained rather than pre-empted.
    for (const status of RECURRING_STATUSES) {
      expect(isActionAvailable(status, "delete")).toBe(true);
    }
  });

  it("hides the transition a template is already in", () => {
    expect(isActionAvailable("Active", "resume")).toBe(false);
    expect(isActionAvailable("Paused", "pause")).toBe(false);
  });
});
