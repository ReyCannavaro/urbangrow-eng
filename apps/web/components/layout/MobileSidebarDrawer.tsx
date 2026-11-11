"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Layers,
  ToggleLeft,
  BarChart3,
  Bot,
  Bell,
  Cpu,
  Smartphone,
  Download,
  Sparkles,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebarDrawer({
  isOpen,
  onClose,
}: MobileSidebarDrawerProps) {
  const pathname = usePathname();
  const { alerts } = useTelemetry();
  const [apkState, setApkState] = useState<"idle" | "checking" | "unavailable">("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close drawer ONLY when pathname genuinely changes (navigating between routes)
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Handle escape key & body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

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
    { label: "Hardware ESP32", href: "/controls#hardware-esp32", icon: Cpu },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] lg:hidden">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className="fixed inset-y-0 left-0 w-[290px] sm:w-[320px] max-w-[85vw] bg-white shadow-2xl z-[1000] p-5 flex flex-col justify-between overflow-y-auto"
        aria-label="Mobile Navigation Menu"
      >
        <div>
          {/* Header with Logo & Close Button */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E7EB]">
            <Link href="/" onClick={onClose} className="inline-flex items-center">
              <Image
                src="/urbangrow-logo.png"
                alt="UrbanGrow"
                width={140}
                height={38}
                priority
                className="h-7 w-auto object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-[#F3F4F6] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-4">
            {/* Main Menu */}
            <div>
              <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">
                Menu Utama
              </div>
              <nav className="flex flex-col gap-1">
                {mainNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? "text-[#165B39] font-bold bg-[#DCFCE7]/70"
                          : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#165B39]" />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-[#165B39]" : "text-[#9CA3AF]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* System Menu */}
            <div>
              <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">
                Sistem &amp; Hardware
              </div>
              <nav className="flex flex-col gap-1">
                {systemNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? "text-[#165B39] font-bold bg-[#DCFCE7]/70"
                          : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#165B39]" />
                      )}
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-[#165B39]" : "text-[#9CA3AF]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#165B39] text-white shrink-0">
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

        {/* Mobile APK Companion Card in Drawer */}
        <div className="rounded-2xl p-3.5 bg-wavy-ribbon text-white mt-6 shadow-sm shrink-0">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                  <Smartphone className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-bold tracking-tight">
                  Aplikasi Mobile
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-white/15 text-[9px] font-mono font-semibold text-white/90">
                Android
              </span>
            </div>
            <p className="text-[10px] text-white/75 leading-relaxed">
              Monitoring telemetri akuaponik portabel lewat perangkat mobile.
            </p>

            <button
              type="button"
              onClick={handleApkDownload}
              disabled={apkState === "checking"}
              className={`w-full py-2 px-3.5 rounded-full font-semibold text-[11px] shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                apkState === "unavailable"
                  ? "bg-white/20 hover:bg-white/25 text-white border border-white/25"
                  : "bg-[#4EAB7C] hover:bg-[#68C194] text-white"
              }`}
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
    </div>
  );
}
