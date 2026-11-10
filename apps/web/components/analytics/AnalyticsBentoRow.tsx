"use client";

import React from "react";
import {
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Droplets,
  Thermometer,
  Gauge,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AnalyticsBentoRow() {
  const { sensors, systemMeta } = useTelemetry();

  // Dynamic WQI score computed from active physical sensors (pH, Water Temp, TDS)
  const tdsPenalty =
    sensors.tds < 400
      ? (400 - sensors.tds) * 0.03
      : sensors.tds > 800
      ? (sensors.tds - 800) * 0.03
      : 0;
  const wqiScore = Math.max(
    50,
    Math.min(
      98,
      Math.round(
        100 -
          Math.abs((sensors.ph ?? 7.0) - 7.0) * 16 -
          Math.abs((sensors.waterTemperature ?? 24.5) - 24.5) * 2.5 -
          tdsPenalty
      )
    )
  );

  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;
  const formattedTDS =
    typeof sensors.tds === "number"
      ? Math.round(sensors.tds)
      : sensors.tds;
  const formattedPH =
    typeof sensors.ph === "number"
      ? sensors.ph.toFixed(2)
      : sensors.ph;

  const isPhOptimal = sensors.ph >= 6.5 && sensors.ph <= 7.5;
  const isTempOptimal = sensors.waterTemperature >= 22 && sensors.waterTemperature <= 27;
  const isTdsOptimal = sensors.tds >= 400 && sensors.tds <= 800;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. THE INVERTED HERO ANCHOR CARD */}
      <div
        style={{ "--ug-delay": "60ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-[#165B39] hover:bg-[#145233] text-white p-5 shadow-xs flex flex-col justify-between h-[170px] relative overflow-hidden transition-colors group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Water Quality Index (WQI)
          </span>
          <div
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] transition-colors"
            title="Indeks Kualitas Air Holistik"
          >
            <ArrowUpRight className="h-4 w-4 stroke-[2.25] transition-transform duration-200 group-hover:rotate-45" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-white">
            {wqiScore}<span className="text-xl font-normal text-white/80">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
            <TrendingUp className="h-3 w-3 text-[#68C194]" />
            <span>
              {systemMeta.edgeOnline
                ? `Node ${systemMeta.edgeNode} • Terukur`
                : "Stabilitas pH, Suhu & TDS Optimal"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KESTABILAN PH AIR */}
      <div
        style={{ "--ug-delay": "115ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Kestabilan pH Air
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#165B39]">
            <Droplets className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {formattedPH}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">pH</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
              isPhOptimal
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#FEF3C7] text-[#B45309]"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Ideal Nitrifikasi: 6.5 – 7.5 pH</span>
          </div>
        </div>
      </div>

      {/* 3. SUHU AIR KOLAM */}
      <div
        style={{ "--ug-delay": "170ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Suhu Air Kolam
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#0284C7]">
            <Thermometer className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {formattedTemp}
            <span className="text-xl font-normal text-[#9CA3AF] ml-0.5">°C</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
              isTempOptimal
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#FEF3C7] text-[#B45309]"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Ideal Nila &amp; Lele: 22 – 27°C</span>
          </div>
        </div>
      </div>

      {/* 4. NUTRISI TDS TERLARUT */}
      <div
        style={{ "--ug-delay": "225ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Nutrisi TDS Terlarut
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#D97706]">
            <Gauge className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {formattedTDS}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">ppm</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
              isTdsOptimal
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#FEF3C7] text-[#B45309]"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Target Vegetatif: 400 – 800 ppm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
