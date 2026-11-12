import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UrbanGrow Smart Aquaponic",
    short_name: "UrbanGrow",
    description:
      "Autonomous climate-adaptive urban food ecosystem with real-time IoT telemetry, 4-level vertical aquaponics, and predictive decision intelligence.",
    start_url: "/",
    display: "standalone",
    background_color: "#F0F2F5",
    theme_color: "#165B39",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
