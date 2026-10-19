import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/lib/telemetryContext";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0b1329",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "UrbanGrow | Smart Aquaponics Ecosystem",
    template: "%s | UrbanGrow Ecosystem",
  },
  description:
    "Autonomous climate-adaptive urban food ecosystem with real-time IoT telemetry, 4-level vertical aquaponics, and predictive decision intelligence.",
  keywords: [
    "aquaponics",
    "smart agriculture",
    "IoT",
    "climate adaptive",
    "urban farming",
    "predictive AI",
    "Sidoarjo",
    "SMK Telkom Sidoarjo",
  ],
  authors: [{ name: "Regu Mawar - SMK Telkom Sidoarjo" }],
  openGraph: {
    title: "UrbanGrow | Smart Aquaponics Ecosystem",
    description:
      "Autonomous climate-adaptive urban food ecosystem with real-time IoT telemetry, 4-level vertical aquaponics, and predictive decision intelligence.",
    siteName: "UrbanGrow Smart Aquaponic",
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/urbangrow-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <TelemetryProvider>
          <AppShell>{children}</AppShell>
        </TelemetryProvider>
      </body>
    </html>
  );
}
