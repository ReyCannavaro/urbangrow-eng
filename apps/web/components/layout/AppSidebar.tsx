"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Layers,
  ToggleLeft,
  BarChart3,
  Bot,
  Bell,
  Smartphone,
  Download,
  Sparkles,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AppSidebar() {
  const pathname = usePathname();
  const { alerts } = useTelemetry();
  const [apkState, setApkState] = useState<"idle" | "checking" | "unavailable">("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleApkDownload = async () => {
    if (apkState === "checking") return;
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    setApkState("checking");
    try {
      const res = await fetch("/download/urbangrow.apk", { method: "HEAD" });
      const contentType = res.headers.get("content-type") ?? "";
      if (res.ok && !contentType.includes("text/html")) {
        setApkState("idle");
        const anchor = document.createElement("a");
        anchor.href = "/download/urbangrow.apk";
        anchor.download = "UrbanGrow-Mobile.apk";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        return;
      }
      setApkState("unavailable");
      resetTimerRef.current = setTimeout(() => setApkState("idle"), 3500);
    } catch {
      setApkState("unavailable");
      resetTimerRef.current = setTimeout(() => setApkState("idle"), 3500);
    }
  };

  const mainNav = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Menara Kaskade", href: "/ecosystem", icon: Layers },
    { label: "Kontrol Relay", href: "/controls", icon: ToggleLeft },
    { label: "Analitik IoT", href: "/analytics", icon: BarChart3 },
    { label: "Prediksi AI", href: "/ai-insights", icon: Sparkles },
    { label: "AgriBot AI", href: "/agribot", icon: Bot },
  ];

  const systemNav = [
    {
      label: "Notifikasi",
      href: "/alerts",
      icon: Bell,
      badge: alerts.length > 0 ? alerts.length : null,
    },
  ];

  return (
    <aside className="app-sidebar-panel hidden lg:flex shrink-0 flex-col justify-between p-4 sm:p-5 rounded-[24px] lg:rounded-[28px] bg-white border border-[#E5E7EB] shadow-xs select-none">
      <div className="min-h-0 flex flex-col">
        {/* Brand Logo Header */}
        <div className="app-sidebar-brand flex items-center justify-between gap-2 mb-3.5 pl-1 shrink-0">
          <Link href="/" className="inline-flex items-center shrink-0">
            <Image
              src="/urbangrow-logo.png"
              alt="UrbanGrow"
              width={150}
              height={42}
              priority
              className="app-sidebar-logo h-7 w-auto object-contain"
            />
          </Link>
          <span className="lg:hidden px-2.5 py-0.5 rounded-full bg-[#DCFCE7]/80 text-[#165B39] font-mono text-[10px] font-bold">
            ECAD Hub
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="app-sidebar-groups flex flex-col gap-3">
          <div>
            <div className="app-sidebar-heading px-2.5 lg:px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">
              Menu Utama
            </div>
            <nav className="app-sidebar-nav grid grid-cols-2 sm:grid-cols-3 gap-1 lg:flex lg:flex-col">
              {mainNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`app-sidebar-link relative min-w-0 flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "text-[#165B39] font-semibold bg-[#DCFCE7]/50"
                        : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#165B39]" />
                    )}
                    <Icon
                      className={`app-sidebar-icon h-4 w-4 shrink-0 ${
                        isActive ? "text-[#165B39]" : "text-[#9CA3AF]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="app-sidebar-heading px-2.5 lg:px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">
              Sistem
            </div>
            <nav className="app-sidebar-nav grid grid-cols-2 gap-1 lg:flex lg:flex-col">
              {systemNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`app-sidebar-link relative min-w-0 flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "text-[#165B39] font-semibold bg-[#DCFCE7]/50"
                        : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#165B39]" />
                    )}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`app-sidebar-icon h-4 w-4 shrink-0 ${
                          isActive ? "text-[#165B39]" : "text-[#9CA3AF]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-[#165B39] text-white shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Mobile Companion Card (Adapted cleanly for responsive width & locked height) */}
      <div className="app-sidebar-mobile-card rounded-2xl p-3 bg-wavy-ribbon text-white mt-3.5 shadow-sm shrink-0">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 lg:flex-col lg:items-stretch lg:gap-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 lg:justify-between mb-0.5 lg:mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-5 w-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                  <Smartphone className="h-3 w-3 text-white" />
                </div>
                <span className="text-[11px] font-bold tracking-tight truncate">
                  Aplikasi Mobile
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-white/15 text-[8.5px] font-mono font-semibold text-white/90 shrink-0">
                Android
              </span>
            </div>
            <p className="app-sidebar-mobile-desc text-[10px] text-white/75 leading-snug lg:mb-2">
              Monitoring akuaponik portabel lewat perangkat Android.
            </p>
          </div>

          <button
            type="button"
            onClick={handleApkDownload}
            disabled={apkState === "checking"}
            className={`app-sidebar-mobile-cta inline-flex items-center justify-center gap-1.5 w-full sm:w-auto lg:w-full py-1.5 px-3.5 rounded-full font-semibold text-[10.5px] shadow-xs transition-colors shrink-0 cursor-pointer ${
              apkState === "unavailable"
                ? "bg-white/20 hover:bg-white/25 text-white border border-white/25"
                : "bg-[#4EAB7C] hover:bg-[#68C194] text-white"
            }`}
            title={
              apkState === "unavailable"
                ? "Paket APK Android belum diunggah ke server produksi"
                : "Unduh aplikasi Android UrbanGrow (.apk)"
            }
          >
            <Download className="h-3 w-3 shrink-0" />
            <span>
              {apkState === "checking"
                ? "Memeriksa..."
                : apkState === "unavailable"
                ? "APK Segera Hadir"
                : "Download APK"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
