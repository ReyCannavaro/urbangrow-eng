"use client";

import React from "react";
import { Calendar } from "lucide-react";

export function HarvestProjectionsSidebar() {
  return (
    <div className="rounded-[28px] bg-white border border-[var(--border-light)] p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-light)]">
        <Calendar className="h-4 w-4 text-[var(--accent-yellow-deep)]" />
        <h3 className="font-semibold text-sm text-[var(--text-primary)]">Proyeksi Panen (XGBoost)</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex justify-between font-semibold">
            <span>Sayuran Kangkung (L2)</span>
            <span className="text-emerald-700 font-mono">H-4 Panen</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">
            Target: 220g / ikat • Biomassa siap konsumsi 28 Oktober 2026
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex justify-between font-semibold">
            <span>Sayuran Pakcoy (L4)</span>
            <span className="text-emerald-700 font-mono">H-7 Panen</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">
            Target: 180g / pod • Fotosintesis 8 jam/hari terjaga
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex justify-between font-semibold">
            <span>Ikan Nila Merah (L3)</span>
            <span className="text-sky-700 font-mono">42 Hari Lagi</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">
            Target: 450g / ekor • Pertumbuhan konsisten dengan FCR 1.2
          </p>
        </div>
      </div>
    </div>
  );
}
