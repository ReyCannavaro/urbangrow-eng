"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Bell, ShieldCheck } from "lucide-react";

interface AlertsHeaderProps {
  onClearAll: () => void;
  activeCount: number;
}

export function AlertsHeader({ onClearAll, activeCount }: AlertsHeaderProps) {
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
                Pusat Notifikasi & Early Warning
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
                Hardware Guard • Aktif
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Log peringatan anomali lingkungan, riwayat otomasi aktuator relay, dan catatan stabilitas bioproses ekosistem akuaponik.
            </p>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/20 text-[11px] font-mono font-semibold text-[#166534] shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{activeCount > 0 ? `${activeCount} Log Aktif` : "Seluruh Log Beres"}</span>
        </div>

        <button
          onClick={onClearAll}
          className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#111827] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          title="Bersihkan semua notifikasi"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus Semua Log</span>
        </button>
      </div>
    </div>
  );
}
