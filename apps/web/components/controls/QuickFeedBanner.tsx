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
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h3 className="font-bold text-sm text-[#111827]">
          Dispensasi Pakan Cepat (35g Pelet Terapung)
        </h3>
        <p className="text-xs text-[#6B7280] max-w-xl leading-relaxed">
          {edgeOnline
            ? `Mengirim pulse 3 detik ke dispenser ${edgeNode} untuk menjatuhkan 35g pelet di luar jadwal.`
            : "ESP32 offline. Menekan tombol menaruh pulse 35g di antrean perintah server (berlaku 3 detik)."}
        </p>
      </div>

      <button
        type="button"
        onClick={onDispense}
        disabled={feedActive}
        className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-semibold text-xs flex items-center justify-center transition-colors shrink-0 ${
          feedActive
            ? edgeOnline
              ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/20 cursor-default"
              : "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] cursor-default"
            : edgeOnline
            ? "bg-[#165B39] hover:bg-[#124B2E] text-white cursor-pointer"
            : "bg-white hover:bg-[#F9FAFB] text-[#111827] border border-[#E5E7EB] hover:border-[#D1D5DB] cursor-pointer"
        }`}
      >
        {feedActive
          ? edgeOnline
            ? "Mengirim Pulse 35g..."
            : "Pulse Masuk Antrean (3s)"
          : edgeOnline
          ? "Beri Pakan Sekarang (35g)"
          : "Antrekan Pulse Pakan"}
      </button>
    </div>
  );
}
