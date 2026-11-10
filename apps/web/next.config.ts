import type { NextConfig } from "next";

const defaultBackendOrigin =
  process.env.NODE_ENV === "production"
    ? "https://urbangrow-api.reycannavaro.dev"
    : "http://localhost:3000";

const backendOrigin = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_INTERNAL_URL ||
  defaultBackendOrigin
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
