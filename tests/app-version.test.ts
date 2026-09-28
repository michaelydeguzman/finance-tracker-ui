import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import pkg from "@/package.json";

describe("app version", () => {
  it("is inlined into the build from package.json", () => {
    expect(nextConfig.env?.NEXT_PUBLIC_APP_VERSION).toBe(pkg.version);
  });

  it("is plain semver", () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
  });
});
