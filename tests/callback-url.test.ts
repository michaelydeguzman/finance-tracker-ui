import { describe, expect, it } from "vitest";
import { isSafeCallbackUrl } from "@/lib/safe-callback-url";

describe("isSafeCallbackUrl", () => {
  it("allows same-origin paths", () => {
    for (const value of ["/", "/income", "/a?b=1#c", "/deep/path/here"]) {
      expect(isSafeCallbackUrl(value)).toBe(true);
    }
  });

  it("blocks protocol-relative and absolute URLs", () => {
    for (const value of ["//evil.com", "https://evil.com", "http://evil.com"]) {
      expect(isSafeCallbackUrl(value)).toBe(false);
    }
  });

  it("blocks the backslash spelling of a protocol-relative URL", () => {
    // Browsers treat a backslash as a path separator, so "/\evil.com" resolves to
    // https://evil.com — a leading-"//" check alone lets this through.
    expect(isSafeCallbackUrl("/\\evil.com")).toBe(false);
    expect(isSafeCallbackUrl("/\\\\evil.com")).toBe(false);
    expect(isSafeCallbackUrl("/\\/evil.com")).toBe(false);
  });

  it("blocks anything not rooted at a slash", () => {
    for (const value of ["", "evil.com", "javascript:alert(1)", "  /income"]) {
      expect(isSafeCallbackUrl(value)).toBe(false);
    }
  });
});
