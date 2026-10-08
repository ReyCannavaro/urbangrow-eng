"use client";

import React from "react";
import {
  Sparkles,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  Fish,
  Sprout,
  ArrowUpRight,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AgriBotBentoRow() {
  const { sensors } = useTelemetry();

  const formattedPH =
    typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : sensors.ph;
  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;
  const formattedDO =
    typeof sensors.dissolvedOxygen === "number"
      ? sensors.dissolvedOxygen.toFixed(2)
      : sensors.dissolvedOxygen;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. THE INVERTED HERO ANCHOR CARD (Donezo Signature #165B39) */}
      <div className="rounded-[24px] bg-[#165B39] text-white p-5 shadow-sm flex flex-col justify-between h-[170px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Akurasi Model Prediksi (ECAD)
          </span>
          <div
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] shadow-xs group-hover:scale-105 transition-transform"
            title="Akurasi Model Machine Learning"
          >
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-white transition-all duration-300">
            96.4<span className="text-xl font-normal text-white/80">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
            <TrendingUp className="h-3 w-3 text-[#68C194]" />
            <span>R² = 0.94 • Evaluasi XGBoost Regressor</span>
          </div>
        </div>
      </div>

      {/* 2. KONTEKS TELEMETRI AIR */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Konteks Telemetri Air
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Activity className="h-4 w-4 text-[#165B39]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {formattedPH}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">pH</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>DO: {formattedDO} mg/L • Suhu {formattedTemp}°C</span>
          </div>
        </div>
      </div>

      {/* 3. PROYEKSI PANEN TERDEKAT */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Panen Terdekat (Kangkung L2)
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Sprout className="h-4 w-4 text-[#D97706]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            H-4
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">Hari</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-medium text-[#B45309]">
            <Calendar className="h-3 w-3" />
            <span>Target: 220g/ikat • Siap Panen</span>
          </div>
        </div>
      </div>

      {/* 4. FEED CONVERSION RATIO (FCR) */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Efisiensi Pakan Ikan Nila
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Fish className="h-4 w-4 text-[#0284C7]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            1.20
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">FCR</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Bobot Target: 450g • Sehat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
