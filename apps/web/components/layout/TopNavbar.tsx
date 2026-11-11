"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Mail, Menu } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { CommandPaletteModal } from "./CommandPaletteModal";

interface TopNavbarProps {
  compact?: boolean;
  onOpenMobileMenu?: () => void;
}

export function TopNavbar({ compact = false, onOpenMobileMenu }: TopNavbarProps) {
  const { alerts } = useTelemetry();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasActiveAlerts = alerts.some((a) => !a.isResolved);

  return (
    <header
      className={`bg-white rounded-[24px] border border-[#E5E7EB] p-3.5 sm:px-6 sm:py-3 shadow-xs flex items-center justify-between gap-3 sm:gap-4 shrink-0 ${
        compact ? "mb-3 lg:mb-4" : "mb-6"
      }`}
    >
      {/* Left: Mobile Hamburger Button (3-Bar Icon) + Search Trigger */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-0">
        {/* 3-Bar Hamburger Menu Trigger on Mobile Screen */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenMobileMenu?.();
          }}
          className="lg:hidden h-9 w-9 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] active:bg-[#E5E7EB] hover:border-[#D1D5DB] flex items-center justify-center text-[#111827] transition-colors shrink-0 cursor-pointer shadow-xs"
          aria-label="Buka Menu Navigasi"
          title="Buka Menu Sidebar"
        >
          <Menu className="h-5 w-5 text-[#111827]" />
        </button>

        {/* Search Input Trigger Pill (Opens Global Command Palette ⌘K) */}
        <div className="flex-1 relative min-w-0">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="w-full relative flex items-center text-left pl-9 sm:pl-10 pr-10 sm:pr-14 py-2 text-xs rounded-full border border-[#E5E7EB] bg-[#F8F9FA] text-[#9CA3AF] hover:bg-white hover:border-[#D1D5DB] transition-colors cursor-pointer"
          >
            <Search className="absolute left-3 sm:left-3.5 h-3.5 sm:h-4 w-3.5 sm:w-4 text-[#9CA3AF]" />
            <span className="truncate">Cari sensor, aktuator, atau data log...</span>
            <span className="hidden sm:inline-block absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-[#6B7280] bg-white border border-[#E5E7EB]">
              ⌘ K
            </span>
          </button>
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Analytics Report Shortcut */}
        <Link
          href="/analytics"
          className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
          title="Laporan Analitik"
        >
          <Mail className="h-4 w-4" />
        </Link>

        {/* Notification Bell Button */}
        <Link
          href="/alerts"
          className="relative h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
          title="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {hasActiveAlerts && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile / Farm Owner */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2">
          <div className="h-9 w-9 rounded-full bg-[#165B39] text-white flex items-center justify-center font-bold text-xs">
            RC
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-[#111827] leading-tight">
              Rey Cannavaro
            </div>
            <div className="text-[10px] text-[#9CA3AF] leading-tight">
              Regu Mawar • SMK Telkom
            </div>
          </div>
        </div>
      </div>

      <CommandPaletteModal
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </header>
  );
}
