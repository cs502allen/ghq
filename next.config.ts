import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // @todo figure out why tsconfig doesn't exclude node modules
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
