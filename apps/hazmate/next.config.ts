import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bigrigs/shared-ai", "@bigrigs/types"]
};

export default nextConfig;
