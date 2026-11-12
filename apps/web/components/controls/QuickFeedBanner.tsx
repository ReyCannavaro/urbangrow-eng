"use client";

import React from "react";

interface QuickFeedBannerProps {
  onDispense: () => void;
  feedActive: boolean;
  edgeOnline: boolean;
  edgeNode?: string;
}

export function QuickFeedBanner({
  onDispense,
  feedActive,
  edgeOnline,
  edgeNode = "ESP32-GROW-01",
}: QuickFeedBannerProps) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/50 hover:border-[#D1D5DB] transition-colors p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
            edgeOnline ? "text-[#165B39]" : "text-[#6B7280]"
          }`}
        >
          {edgeOnline
            ? `Manual Feed Pulse • ${edgeNode} Online`
            : "Manual Feed Queue • ESP32 Offline"}
        </span>
        <h3 className="font-bold text-sm text-[#111827] mt-0.5">
          Dispensasi Pakan Cepat (35g Pelet Terapung)
        </h3>
        <p className="text-xs text-[#6B7280] mt-1 max-w-xl leading-relaxed">
          {edgeOnline
            ? "Mengirim pulse 3 detik ke relay dispenser agar 35g pelet jatuh ke kolam Nila & Lele di luar jadwal otomatis."
            : "ESP32 sedang offline. Menekan tombol hanya menaruh pulse 35g di antrean perintah server (berlaku 3 detik) tanpa menggerakkan aktuator fisik."}
        </p>
      </div>

      <button
        type="button"
        onClick={onDispense}
        disabled={feedActive}
        className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
          feedActive
            ? edgeOnline
              ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/25 cursor-default"
              : "bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB] cursor-default"
            : edgeOnline
            ? "bg-[#165B39] hover:bg-[#124B2E] text-white cursor-pointer"
            : "bg-white hover:bg-[#F9FAFB] text-[#374151] border border-[#D1D5DB] cursor-pointer"
        }`}
      >
        <span>
          {feedActive
            ? edgeOnline
              ? "Mengirim Pulse 35g..."
              : "Pulse Masuk Antrean (3s)"
            : edgeOnline
            ? "Beri Pakan Sekarang (35g)"
            : "Antrekan Pulse Pakan (Offline)"}
        </span>
      </button>
    </div>
  );
}
