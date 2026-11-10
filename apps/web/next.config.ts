import type { NextConfig } from "next";

const backendOrigin = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_INTERNAL_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/download/:path*",
        destination: `${backendOrigin}/download/:path*`,
      },
    ];
  },
};

export default nextConfig;
