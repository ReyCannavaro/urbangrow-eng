"use client";

import React from "react";
import { Send, Check } from "lucide-react";

interface QuickFeedBannerProps {
  onDispense: () => void;
  feedActive: boolean;
}

export function QuickFeedBanner({ onDispense, feedActive }: QuickFeedBannerProps) {
  return (
    <div className="rounded-[28px] bg-white border border-[var(--border-light)] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-sm text-[var(--text-primary)]">Dispensasi Pakan Cepat</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Sebar 35 gram pakan pelet mengapung untuk ikan Nila (Level 3) & Lele (Level 1) di luar jadwal otomatis
        </p>
      </div>

      <button
        onClick={onDispense}
        className={`w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ${
          feedActive
            ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/30"
            : "bg-[#165B39] hover:bg-[#124B2E] text-white"
        }`}
      >
        {feedActive ? <Check className="h-4 w-4 stroke-[3]" /> : <Send className="h-4 w-4" />}
        <span>{feedActive ? "Pakan Berhasil Disebar!" : "Beri Pakan Sekarang"}</span>
      </button>
    </div>
  );
}
