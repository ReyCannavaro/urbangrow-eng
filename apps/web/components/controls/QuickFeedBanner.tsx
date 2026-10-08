"use client";

import React from "react";
import { Send, Check, Utensils } from "lucide-react";

interface QuickFeedBannerProps {
  onDispense: () => void;
  feedActive: boolean;
}

export function QuickFeedBanner({ onDispense, feedActive }: QuickFeedBannerProps) {
  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-2xl bg-[#DCFCE7] text-[#165B39] flex items-center justify-center shrink-0 shadow-2xs">
          <Utensils className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#111827]">
              Dispensasi Pakan Cepat (Manual Feed Override)
            </h3>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[10px] font-mono font-bold text-[#165B39]">
              Dosis: 35 Gram
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
            Solenoid 12V mendistribusikan pelet terapung bernutrisi ke kolam Nila & Lele secara instan di luar jadwal otomatis.
          </p>
        </div>
      </div>

      <button
        onClick={onDispense}
        className={`w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 ${
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
