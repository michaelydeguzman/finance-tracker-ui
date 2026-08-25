import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

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
