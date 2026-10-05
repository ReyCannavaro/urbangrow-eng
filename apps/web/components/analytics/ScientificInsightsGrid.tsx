"use client";

import React from "react";
import { CheckCircle2, Thermometer, Sun } from "lucide-react";

export function ScientificInsightsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-[24px] bg-white border border-[var(--border-light)] p-5 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-xs text-emerald-800 mb-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Indeks Konversi Nitrifikasi</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          94% amonia limbah ikan berhasil diubah menjadi nitrat ramah tanaman oleh bakteri nitrifikasi di substrat
          Kangkung.
        </p>
      </div>

      <div className="rounded-[24px] bg-white border border-[var(--border-light)] p-5 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-xs text-sky-800 mb-1">
          <Thermometer className="h-4 w-4 text-sky-600" />
          <span>Korelasi Invers Suhu vs Oksigen</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Fluktuasi suhu air berkorelasi -0.82 terhadap kelarutan DO; aerator otomatis menjaga ketersediaan oksigen Nila
          saat suhu naik.
        </p>
      </div>

      <div className="rounded-[24px] bg-white border border-[var(--border-light)] p-5 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-xs text-amber-900 mb-1">
          <Sun className="h-4 w-4 text-amber-600" />
          <span>Spektrum Fotosintesis Buatan</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Array LED 85W memberikan spektrum merah-biru (PAR) 8 jam/hari, menjamin pertumbuhan daun Pakcoy optimal di
          dalam ruangan.
        </p>
      </div>
    </div>
  );
}
