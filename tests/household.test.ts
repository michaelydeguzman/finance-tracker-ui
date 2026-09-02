import { describe, expect, it } from "vitest";
import {
  HOUSEHOLD_NAME_MAX_LENGTH,
  INVITED_EMAIL_MAX_LENGTH,
  memberLabel,
  validateHouseholdName,
  validateInvitedEmail,
} from "@/lib/household";

describe("validateHouseholdName", () => {
  it("accepts a name and returns it trimmed", () => {
    expect(validateHouseholdName("  De Guzman Household  ")).toEqual({
      ok: true,
      value: "De Guzman Household",
    });
  });

  it("rejects whitespace, which would render as an empty heading", () => {
    expect(validateHouseholdName("   ").ok).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(validateHouseholdName("").ok).toBe(false);
  });

  it("rejects a non-string, since a JSON body can carry anything", () => {
    expect(validateHouseholdName(undefined).ok).toBe(false);
    expect(validateHouseholdName(42).ok).toBe(false);
  });

  it("accepts a name at the API's maximum length", () => {
    expect(
      validateHouseholdName("a".repeat(HOUSEHOLD_NAME_MAX_LENGTH)).ok,
    ).toBe(true);
  });

  it("rejects a name one character past it, rather than letting the API do it", () => {
    expect(
      validateHouseholdName("a".repeat(HOUSEHOLD_NAME_MAX_LENGTH + 1)).ok,
    ).toBe(false);
  });

  it("measures length after trimming, so trailing spaces do not fail a valid name", () => {
    const name = `${"a".repeat(HOUSEHOLD_NAME_MAX_LENGTH)}   `;

    expect(validateHouseholdName(name).ok).toBe(true);
  });
});

describe("validateInvitedEmail", () => {
  it("lowercases the address, because the API matches against a normalized one", () => {
    expect(validateInvitedEmail("  Them@Example.COM ")).toEqual({
      ok: true,
      value: "them@example.com",
    });
  });

  it("rejects an address with no @", () => {
    expect(validateInvitedEmail("them.example.com").ok).toBe(false);
  });

  it("rejects an address with two @", () => {
    expect(validateInvitedEmail("them@example@com").ok).toBe(false);
  });

  it("rejects an address with nothing before the @", () => {
    expect(validateInvitedEmail("@example.com").ok).toBe(false);
  });

  it("rejects an address with nothing after the @", () => {
    expect(validateInvitedEmail("them@").ok).toBe(false);
  });

  it("rejects an address past the API's maximum length", () => {
    const local = "a".repeat(INVITED_EMAIL_MAX_LENGTH);

    expect(validateInvitedEmail(`${local}@example.com`).ok).toBe(false);
  });

  it("rejects a non-string", () => {
    expect(validateInvitedEmail(null).ok).toBe(false);
  });
});

describe("memberLabel", () => {
  it("prefers the display name", () => {
    expect(
      memberLabel({ displayName: "Michael", email: "m@example.com" }),
    ).toBe("Michael");
  });

  it("falls back to the address when there is no display name", () => {
    expect(memberLabel({ displayName: null, email: "m@example.com" })).toBe(
      "m@example.com",
    );
  });

  it("falls back when the display name is only whitespace", () => {
    expect(memberLabel({ displayName: "   ", email: "m@example.com" })).toBe(
      "m@example.com",
    );
  });
});
