import { describe, expect, it } from "vitest";
import {
  AUTH_ERROR_MESSAGES,
  resolveAuthErrorMessage,
} from "@/lib/messages/auth";

describe("resolveAuthErrorMessage", () => {
  it("returns null when there is no error to report", () => {
    for (const value of [null, undefined, ""]) {
      expect(resolveAuthErrorMessage(value)).toBeNull();
    }
  });

  it("resolves the codes the sign-in page can actually receive", () => {
    expect(resolveAuthErrorMessage("AccessDenied")).toBe(
      AUTH_ERROR_MESSAGES.AccessDenied,
    );
    expect(resolveAuthErrorMessage("NoApiSession")).toBe(
      AUTH_ERROR_MESSAGES.NoApiSession,
    );
  });

  it("falls back rather than showing an unknown code to the person", () => {
    // Auth.js can emit error types this app has never seen. "OAuthCallbackError" on screen
    // tells someone nothing they can act on.
    expect(resolveAuthErrorMessage("OAuthCallbackError")).toBe(
      "Sign in failed. Please try again.",
    );
  });

  it("covers every session error this app sets", () => {
    // These come from resolveSessionError rather than a query string, so nothing upstream
    // would catch one going missing from the catalog.
    for (const code of ["ExchangeFailed", "RefreshFailed", "NoApiSession"]) {
      expect(AUTH_ERROR_MESSAGES[code]).toBeDefined();
    }
  });
});
