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
  // Enable experimental features
  experimental: experimentalConfig,

  // Performance optimizations
  compress: true,

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle analyzer (uncomment for analysis)
  // bundlePagesRouterDependencies: true,

  // Type checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
