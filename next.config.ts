import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Quote form accepts a photo up to 10MB (Server Actions default to 1MB)
    serverActions: { bodySizeLimit: "11mb" },
  },
};

export default nextConfig;
