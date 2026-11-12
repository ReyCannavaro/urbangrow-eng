import type { NextConfig } from "next";

const defaultBackendOrigin =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_INTERNAL_URL ||
  "https://urbangrow-api.reycannavaro.dev";

const backendOrigin = defaultBackendOrigin.replace(/\/+$/, "");

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
