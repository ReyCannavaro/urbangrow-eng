"use client";

import React from "react";
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
  Cpu,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AppSidebar() {
  const pathname = usePathname();
  const { alerts } = useTelemetry();

  const mainNav = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Menara Kaskade", href: "/ecosystem", icon: Layers },
    { label: "Kontrol Relay", href: "/controls", icon: ToggleLeft },
    { label: "Analitik IoT", href: "/analytics", icon: BarChart3 },
    { label: "AgriBot AI", href: "/agribot", icon: Bot },
  ];

  const systemNav = [
    {
      label: "Notifikasi",
      href: "/alerts",
      icon: Bell,
      badge: alerts.length > 0 ? alerts.length : null,
    },
    { label: "Hardware ESP32", href: "/controls", icon: Cpu },
  ];

  return (
    <aside className="w-full lg:w-60 shrink-0 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] flex flex-col justify-between p-5 rounded-[28px] bg-white border border-[#E5E7EB] shadow-xs overflow-y-auto">
      <div>
        {/* Brand Logo */}
        <Link href="/" className="inline-block mb-6 pl-1">
          <Image
            src="/urbangrow-logo.png"
            alt="UrbanGrow"
            width={150}
            height={42}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Menu Section */}
        <div className="space-y-5">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "text-[#165B39] font-semibold bg-[#DCFCE7]/50"
                        : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    {/* Active Left Indicator Bar (Matching Donezo) */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#165B39]" />
                    )}
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-[#165B39]" : "text-[#9CA3AF]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">
              Sistem
            </div>
            <nav className="space-y-1">
              {systemNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "text-[#165B39] font-semibold bg-[#DCFCE7]/50"
                        : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-[#165B39]" : "text-[#9CA3AF]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-[#165B39] text-white">
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

      {/* Bottom Download Mobile App Banner (Matching Donezo Bottom Card) */}
      <div className="rounded-2xl p-3.5 bg-wavy-ribbon text-white mt-4 shadow-sm shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-5 rounded-md bg-white/20 flex items-center justify-center">
            <Smartphone className="h-3 w-3 text-white" />
          </div>
          <span className="text-[11px] font-bold">Aplikasi Mobile</span>
        </div>
        <p className="text-[10px] text-white/70 mb-2.5 leading-snug">
          Unduh build APK terbaru untuk monitoring akuaponik portabel.
        </p>
        <a
          href="/download/urbangrow.apk"
          className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-full bg-[#4EAB7C] hover:bg-[#68C194] text-white font-semibold text-[10.5px] shadow-sm transition-colors"
        >
          <span>Download APK</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </aside>
  );
}
