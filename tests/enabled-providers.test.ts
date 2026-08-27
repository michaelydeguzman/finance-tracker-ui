import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { describe, expect, it } from "vitest";
import { summarizeProviders } from "@/lib/auth-providers";

/**
 * The sign-in page renders one button per SSO provider, keyed by id.
 *
 * Auth.js factories report their own defaults until core merges in the config they were
 * handed, so both credential flows once summarized as `credentials`: two buttons labelled
 * "Continue with Credentials", a duplicate React key, and a `signIn` call naming a provider
 * id that was never registered.
 */
describe("summarizeProviders", () => {
  it("resolves the id and name a provider was configured with", () => {
    const summaries = summarizeProviders([
      Credentials({ id: "password", name: "Email and password" }),
      Credentials({ id: "magic-link", name: "Email link" }),
    ]);

    expect(summaries).toEqual([
      { id: "password", name: "Email and password" },
      { id: "magic-link", name: "Email link" },
    ]);
  });

  it("keeps every configured provider distinguishable", () => {
    const ids = summarizeProviders([
      Credentials({ id: "password" }),
      Credentials({ id: "magic-link" }),
    ]).map((provider) => provider.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("falls back to the factory's own defaults when nothing is overridden", () => {
    expect(summarizeProviders([Google({})])).toEqual([
      { id: "google", name: "Google" },
    ]);
  });

  it("calls providers passed as a factory rather than a config", () => {
    expect(summarizeProviders([Google])).toEqual([
      { id: "google", name: "Google" },
    ]);
  });
});
