import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove headers configuration as it's handled by middleware
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fyokqtyufvqejucputeq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
