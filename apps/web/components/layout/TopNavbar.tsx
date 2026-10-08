"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, Mail, Radio, User } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function TopNavbar() {
  const { backendConnected, alerts } = useTelemetry();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
      {/* Search Input Bar (Matching Donezo Pill with Shortcut Badge) */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari sensor, aktuator, atau data log..."
            className="w-full pl-10 pr-14 py-2 text-xs rounded-full border border-[#E5E7EB] bg-[#F8F9FA] placeholder:text-[#9CA3AF] text-[#111827] focus:outline-none focus:border-[#165B39] focus:bg-white transition-colors"
          />
          <span className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-[#9CA3AF] bg-white border border-[#E5E7EB] shadow-2xs">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-3">
        {/* Live Backend Connection Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-mono shadow-2xs">
          <span
            className={`h-2 w-2 rounded-full ${
              backendConnected
                ? "bg-[#165B39] shadow-[0_0_8px_rgba(22,91,57,0.6)]"
                : "bg-amber-400 animate-pulse"
            }`}
          />
          <span
            className={
              backendConnected
                ? "text-[#165B39] font-bold"
                : "text-[#9CA3AF]"
            }
          >
            {backendConnected ? "Elysia :3000 (Live)" : "Menghubungkan..."}
          </span>
        </div>

        {/* Mail / System Report Button */}
        <Link
          href="/analytics"
          className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs"
          title="Laporan Analitik"
        >
          <Mail className="h-4 w-4" />
        </Link>

        {/* Notification Bell Button */}
        <Link
          href="/alerts"
          className="relative h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs"
          title="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile / Farm Owner (Matching Totok Michael in Donezo) */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="h-9 w-9 rounded-full bg-[#165B39] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            RC
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-[#111827] leading-tight">
              Rey Cannavaro
            </div>
            <div className="text-[10px] text-[#9CA3AF] leading-tight">
              Regu Mawar • SMK Telkom
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
