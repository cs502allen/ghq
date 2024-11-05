import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    tsconfigPath: "./tsconfig.json",
    // @todo figure out why tsconfig doesn't exclude node modules
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
