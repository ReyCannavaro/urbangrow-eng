"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, ShieldCheck } from "lucide-react";

interface AlertsHeaderProps {
  onClearAll: () => void;
  activeCount: number;
}

export function AlertsHeader({ onClearAll, activeCount }: AlertsHeaderProps) {
  return (
    <section
      style={{ "--ug-delay": "0ms" } as React.CSSProperties}
      className="ug-enter flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors shrink-0 shadow-2xs"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            Pusat Notifikasi &amp; Early Warning
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
            Log peringatan anomali lingkungan dan riwayat audit aktuator relay dari database.
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/15 text-[11px] font-mono font-semibold text-[#166534]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{activeCount > 0 ? `${activeCount} Log Aktif` : "Seluruh Log Beres"}</span>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] text-[#4B5563] hover:text-[#111827] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Bersihkan semua notifikasi"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus Semua Log</span>
        </button>
      </div>
    </section>
  );
}
