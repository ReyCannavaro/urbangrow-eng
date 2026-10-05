"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Settings, Bell, User, Radio, Sprout } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function NavigationHeader() {
  const pathname = usePathname();
  const { backendConnected, alerts } = useTelemetry();

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Ekosistem", href: "/ecosystem" },
    { label: "Kontrol", href: "/controls" },
    { label: "Analitik", href: "/analytics" },
    { label: "AgriBot", href: "/agribot" },
    { label: "Notifikasi", href: "/alerts" },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Brand Pill (with official UrbanGrow logo) */}
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--border-medium)] bg-white shadow-sm hover:border-black transition-all group"
      >
        <Image
          src="/urbangrow-logo.png"
          alt="UrbanGrow Logo"
          width={84}
          height={32}
          priority
          className="h-6 w-auto object-contain transition-transform group-hover:scale-105"
        />
        <span className="hidden sm:inline-block h-3.5 w-px bg-stone-200" />
        <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-stone-500 tracking-wider">
          ECAD IoT
        </span>
      </Link>

      {/* Center Segmented Pill Navigation */}
      <nav className="inline-flex items-center p-1 rounded-full border border-[var(--border-medium)] bg-white/80 backdrop-blur-md shadow-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-[var(--bg-charcoal)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Utility Buttons (Matching Setting, Bell, User icons in circular pills) */}
      <div className="flex items-center gap-2">
        {/* Backend Connectivity Status Pill */}
        <div
          title={backendConnected ? "ElysiaJS Backend Active on Port 3000" : "Simulated Generative Feed Active"}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-medium)] bg-white text-[11px] font-mono font-medium shadow-sm"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              backendConnected ? "bg-[var(--accent-emerald)]" : "bg-[var(--accent-yellow-deep)] animate-pulse"
            }`}
          />
          <span className="text-[var(--text-secondary)]">
            {backendConnected ? "Elysia :3000" : "Simulated"}
          </span>
        </div>

        {/* Setting Button */}
        <Link
          href="/controls"
          className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border-medium)] bg-white text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-black transition-colors shadow-sm"
          title="Pengaturan Kontrol"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* Notification Bell Button */}
        <Link
          href="/alerts"
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border-medium)] bg-white text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-black transition-colors shadow-sm"
          title="Pusat Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--accent-yellow-deep)] ring-2 ring-white" />
          )}
        </Link>

        {/* User / Farm Profile Pill */}
        <div
          className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border-medium)] bg-white text-[var(--text-secondary)] shadow-sm"
          title="Urban Farm 01 Profile"
        >
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
