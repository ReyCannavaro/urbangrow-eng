"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Cpu } from "lucide-react";

interface ControlsHeaderProps {
  totalLoadWatts: number;
  activeCount: number;
  totalCount: number;
}

export function ControlsHeader({
  totalLoadWatts,
  activeCount,
  totalCount,
}: ControlsHeaderProps) {
  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
                Kontrol Sistem & Aktuator
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
                ESP32 DevKit V1 • 5 Relays
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Manajemen saklar relay IoT bertenaga catu daya ganda (Adaptor 12V DC & Baterai Backup 7Ah).
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Hardware Badges */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/20 text-[11px] font-mono font-semibold text-[#166534] shadow-2xs">
          <Zap className="h-3.5 w-3.5" />
          <span>Total Daya: <strong>{totalLoadWatts}W</strong></span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-mono text-[#111827] shadow-2xs">
          <Cpu className="h-3.5 w-3.5 text-[#165B39]" />
          <span>Aktuator: <strong>{activeCount}/{totalCount} Aktif</strong></span>
        </div>
      </div>
    </div>
  );
}
