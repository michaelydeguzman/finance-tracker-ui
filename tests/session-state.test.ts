import { describe, expect, it } from "vitest";
import { resolveSessionError } from "@/lib/session-state";

describe("resolveSessionError", () => {
  it("reports no error for a session holding API credentials", () => {
    expect(resolveSessionError({ hasApiSession: true })).toBeNull();
  });

  it("reports a session with no API credentials as unusable", () => {
    // The redirect-loop case: a cookie minted before this feature existed carries a user
    // but nothing to call the API with. Left unreported, the middleware and the sign-in
    // page both treat it as signed in and bounce the browser between them forever.
    expect(resolveSessionError({ hasApiSession: false })).toBe("NoApiSession");
  });

  it("keeps a specific failure rather than flattening it to NoApiSession", () => {
    // RefreshFailed and ExchangeFailed each map to their own message on the sign-in page,
    // so the more specific reason has to win.
    expect(
      resolveSessionError({ error: "RefreshFailed", hasApiSession: false }),
    ).toBe("RefreshFailed");
    expect(
      resolveSessionError({ error: "ExchangeFailed", hasApiSession: false }),
    ).toBe("ExchangeFailed");
  });
});
