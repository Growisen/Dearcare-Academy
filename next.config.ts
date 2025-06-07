import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove headers configuration as it's handled by middleware
  outputFileTracing: false,
};

export default nextConfig;
