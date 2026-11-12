"use client";

import React from "react";
import { Trash2 } from "lucide-react";

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          Notifikasi &amp; Audit Sistem
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Peringatan parameter lingkungan dan riwayat perubahan status aktuator relay.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] text-[#111827] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Tandai seluruh peringatan aktif sebagai selesai"
          >
            <Trash2 className="h-3.5 w-3.5 text-[#6B7280]" />
            <span>Selesaikan Semua ({activeCount})</span>
          </button>
        )}
      </div>
    </section>
  );
}
