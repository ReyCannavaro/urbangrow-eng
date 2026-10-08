"use client";

import React from "react";
import { Calendar, Sprout, Fish, Sparkles, CheckCircle2 } from "lucide-react";

export function HarvestProjectionsSidebar() {
  return (
    <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-2xs">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#111827]">
              Proyeksi Panen (XGBoost)
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              Estimasi biomassa berbasis Machine Learning
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
          ML v2.5
        </span>
      </div>

      {/* Projection Cards */}
      <div className="space-y-3.5 text-xs">
        {/* Kangkung L2 */}
        <div className="p-4 rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-2.5 hover:border-[#D1D5DB] transition-colors">
          <div className="flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2 text-[#111827]">
              <Sprout className="h-4 w-4 text-[#165B39]" />
              <span>Sayuran Kangkung (L2)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-mono font-bold text-[10px]">
              H-4 Panen
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#6B7280]">
              <span>Hari ke-17 / 21</span>
              <span className="font-bold text-[#166534]">85% Siklus</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#165B39] to-[#4EAB7C] rounded-full"
                style={{ width: "85%" }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4B5563] pt-1 border-t border-[#E5E7EB]/60">
            Target Biomassa: <strong>220g / ikat</strong> • Siap dipanen 28 Okt 2026.
          </p>
        </div>

        {/* Pakcoy L4 */}
        <div className="p-4 rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-2.5 hover:border-[#D1D5DB] transition-colors">
          <div className="flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2 text-[#111827]">
              <Sprout className="h-4 w-4 text-[#4EAB7C]" />
              <span>Sayuran Pakcoy (L4)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] font-mono font-bold text-[10px]">
              H-7 Panen
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#6B7280]">
              <span>Hari ke-14 / 21</span>
              <span className="font-bold text-[#166534]">66% Siklus</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4EAB7C] to-[#86EFAC] rounded-full"
                style={{ width: "66%" }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4B5563] pt-1 border-t border-[#E5E7EB]/60">
            Target Biomassa: <strong>180g / pod</strong> • Fotoperiode 14 jam optimal.
          </p>
        </div>

        {/* Ikan Nila L3 */}
        <div className="p-4 rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-2.5 hover:border-[#D1D5DB] transition-colors">
          <div className="flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2 text-[#111827]">
              <Fish className="h-4 w-4 text-[#0284C7]" />
              <span>Ikan Nila Merah (L3)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-mono font-bold text-[10px]">
              42 Hari Lagi
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#6B7280]">
              <span>Hari ke-28 / 70</span>
              <span className="font-bold text-[#0284C7]">40% Pertumbuhan</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full"
                style={{ width: "40%" }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4B5563] pt-1 border-t border-[#E5E7EB]/60">
            Target Bobot: <strong>450g / ekor</strong> • FCR 1.20 terverifikasi.
          </p>
        </div>
      </div>

      {/* Model Confidence Box */}
      <div className="p-3.5 rounded-[18px] bg-[#DCFCE7]/40 border border-[#166534]/20 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-[#166534] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#166534] leading-relaxed">
          <strong>Akurasi Model XGBoost: 96.4%</strong> (MAE ±8.2g). Proyeksi diperbarui otomatis setiap siklus ingest telemetri 1500ms.
        </div>
      </div>
    </div>
  );
}
