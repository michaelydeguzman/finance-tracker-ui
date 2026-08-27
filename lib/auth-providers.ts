import type { NextAuthConfig } from "next-auth";

/** What a sign-in button needs to know about one configured provider. */
export interface ProviderSummary {
  id: string;
  name: string;
}

/**
 * Read the id and name each configured provider will actually run under.
 *
 * Auth.js factories return their own defaults at the top level and park the config they
 * were handed under `options`, leaving core to merge the two when it builds a request.
 * Reading `config.id` alone therefore reports `credentials` for every credentials provider
 * no matter what id it was given, so anything filtering or keying on that id sees
 * indistinguishable duplicates.
 */
export const summarizeProviders = (
  providers: NextAuthConfig["providers"],
): ProviderSummary[] =>
  providers.map((provider) => {
    const config = typeof provider === "function" ? provider() : provider;
    const overrides = (config as { options?: Partial<ProviderSummary> })
      .options;

    return {
      id: overrides?.id ?? config.id,
      name: overrides?.name ?? config.name,
    };
  });
