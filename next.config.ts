import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import pkg from "./package.json";

const experimentalConfig: NextConfig["experimental"] = {
  // Enable React Compiler (React 19 feature)
  reactCompiler: true,
  // Enable optimized package imports
  optimizePackageImports: [
    "lucide-react",
    "recharts",
    "@radix-ui/react-avatar",
  ],
};

if (process.env.NEXT_CANARY === "true") {
  experimentalConfig.ppr = "incremental";
}

const nextConfig: NextConfig = {
  experimental: experimentalConfig,

  // The release version, inlined at build time so the running app can name itself. It is
  // semver, bumped by hand in the pull request that makes a release.
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },

  compress: true,

  images: {
    formats: ["image/webp", "image/avif"],
    // SVG through the optimizer is not needed here, and allowing it lets an
    // untrusted SVG carry script. The CSP below is belt-and-braces.
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

// `npm run analyze` sets ANALYZE=true; previously nothing read it.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
