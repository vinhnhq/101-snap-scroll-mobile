import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok.app", "*.ngrok.io"],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
