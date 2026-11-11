"use client";

import React from "react";

interface QuickFeedBannerProps {
  onDispense: () => void;
  feedActive: boolean;
}

export function QuickFeedBanner({ onDispense, feedActive }: QuickFeedBannerProps) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/50 hover:border-[#D1D5DB] transition-colors p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#165B39] block">
          Manual Feed Pulse &bull; Solenoid 12V
        </span>
        <h3 className="font-bold text-sm text-[#111827] mt-0.5">
          Dispensasi Pakan Cepat (35g Pelet Terapung)
        </h3>
        <p className="text-xs text-[#6B7280] mt-1 max-w-xl leading-relaxed">
          Aktuator mendistribusikan 35g pelet protein 32% ke kolam Nila &amp; Lele secara instan di luar siklus jadwal otomatis.
        </p>
      </div>

      <button
        type="button"
        onClick={onDispense}
        disabled={feedActive}
        className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
          feedActive
            ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/25 cursor-default"
            : "bg-[#165B39] hover:bg-[#124B2E] text-white"
        }`}
      >
        <span>{feedActive ? "Pakan Sedang Disebar..." : "Beri Pakan Sekarang (35g)"}</span>
      </button>
    </div>
  );
}
