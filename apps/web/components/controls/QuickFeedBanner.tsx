"use client";

import React from "react";
import { Send, Check, Utensils } from "lucide-react";

interface QuickFeedBannerProps {
  onDispense: () => void;
  feedActive: boolean;
}

export function QuickFeedBanner({ onDispense, feedActive }: QuickFeedBannerProps) {
  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/50 hover:border-[#D1D5DB] transition-colors p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-2xl bg-[#DCFCE7] text-[#165B39] flex items-center justify-center shrink-0">
          <Utensils className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[#111827]">
            Dispensasi Pakan Cepat (Manual Feed Override)
          </h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
            Solenoid 12V mendistribusikan 35g pelet terapung bernutrisi ke kolam Nila &amp; Lele secara instan di luar jadwal otomatis.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDispense}
        className={`w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 ${
          feedActive
            ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/25"
            : "bg-[#165B39] hover:bg-[#124B2E] text-white"
        }`}
      >
        {feedActive ? <Check className="h-4 w-4 stroke-[3]" /> : <Send className="h-4 w-4" />}
        <span>{feedActive ? "Pakan Berhasil Disebar!" : "Beri Pakan Sekarang"}</span>
      </button>
    </div>
  );
}
