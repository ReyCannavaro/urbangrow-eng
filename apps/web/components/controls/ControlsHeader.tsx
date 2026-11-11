"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div
      style={{ "--ug-delay": "0ms" } as React.CSSProperties}
      className="ug-enter bg-white rounded-[20px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
              Kontrol Sistem &amp; Aktuator
            </h1>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Manajemen saklar relay IoT bertenaga catu daya ganda (Adaptor 12V DC &amp; Baterai Backup 7Ah).
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Hardware Badges */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0 font-mono text-[11px]">
        <div className="px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/15 font-semibold text-[#166534]">
          Daya: <strong className="text-[#166534]">{totalLoadWatts}W</strong>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827]">
          Aktuator: <strong>{activeCount}/{totalCount} ON</strong>
        </div>
      </div>
    </div>
  );
}
