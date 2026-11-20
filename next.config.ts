import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.24.10.9"],
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
