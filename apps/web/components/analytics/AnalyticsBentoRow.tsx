"use client";

import React from "react";
import { ArrowUpRight, TrendingUp, CheckCircle2, Droplets, Thermometer, Waves } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AnalyticsBentoRow() {
  const { sensors } = useTelemetry();

  // Dynamic WQI score with graceful stability
  const wqiScore = Math.max(
    50,
    Math.min(
      98,
      Math.round(
        100 -
          Math.abs((sensors.ph ?? 7.0) - 7.0) * 16 -
          Math.max(0, 6.5 - (sensors.dissolvedOxygen ?? 7.2)) * 8 -
          Math.abs((sensors.waterTemperature ?? 24.5) - 24.5) * 2.5
      )
    )
  );

  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;
  const formattedDO =
    typeof sensors.dissolvedOxygen === "number"
      ? sensors.dissolvedOxygen.toFixed(2)
      : sensors.dissolvedOxygen;
  const formattedPH =
    typeof sensors.ph === "number"
      ? sensors.ph.toFixed(2)
      : sensors.ph;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. THE INVERTED HERO ANCHOR CARD (Donezo Signature #165B39) */}
      <div className="rounded-[24px] bg-[#165B39] text-white p-5 shadow-sm flex flex-col justify-between h-[170px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Water Quality Index (WQI)
          </span>
          <div
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] shadow-xs group-hover:scale-105 transition-transform"
            title="Indeks Kualitas Air Holistik"
          >
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-white transition-all duration-300">
            {wqiScore}<span className="text-xl font-normal text-white/80">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
            <TrendingUp className="h-3 w-3 text-[#68C194]" />
            <span>+3.8% Stabilitas 24 Jam • Buffer Optimal</span>
          </div>
        </div>
      </div>

      {/* 2. KESTABILAN PH AIR */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Kestabilan pH Air
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Droplets className="h-4 w-4 text-[#165B39]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {formattedPH}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">pH</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Delta 24J: ±0.06 • Buffer Nitrifikasi</span>
          </div>
        </div>
      </div>

      {/* 3. SUHU AIR KOLAM */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Suhu Air Kolam
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Thermometer className="h-4 w-4 text-[#0284C7]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {formattedTemp}
            <span className="text-xl font-normal text-[#9CA3AF] ml-0.5">°C</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ideal Nila: 24 - 28°C (Delta ±0.3°C)</span>
          </div>
        </div>
      </div>

      {/* 4. DISSOLVED OXYGEN (DO) */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Saturasi Oksigen (DO)
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Waves className="h-4 w-4 text-[#0284C7]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {formattedDO}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">mg/L</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Saturasi 98% • Aerator Venturi Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
