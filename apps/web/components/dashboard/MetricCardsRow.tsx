"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, CheckCircle2, ShieldCheck } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function MetricCardsRow() {
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
  const formattedTDS =
    typeof sensors.tds === "number"
      ? Math.round(sensors.tds)
      : sensors.tds;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. THE INVERTED HERO ANCHOR CARD (Matching Total Projects 24 in Donezo) */}
      <div className="rounded-[24px] bg-[#165B39] text-white p-5 shadow-sm flex flex-col justify-between h-[170px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Kualitas Air (WQI)
          </span>
          <Link
            href="/analytics"
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] shadow-xs group-hover:scale-105 transition-transform"
            title="Detail WQI"
          >
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-white transition-all duration-300">
            {wqiScore}<span className="text-xl font-normal text-white/80">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
            <TrendingUp className="h-3 w-3 text-[#68C194]" />
            <span>+4.2% Seimbang dari siklus lalu</span>
          </div>
        </div>
      </div>

      {/* 2. SUHU AIR KOLAM (Matching Ended Projects 10 in Donezo) */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Suhu Air Kolam
          </span>
          <Link
            href="/ecosystem"
            className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] group-hover:text-[#111827] group-hover:border-[#111827] transition-colors"
            title="Detail Ekosistem"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {formattedTemp}
            <span className="text-xl font-normal text-[#9CA3AF]">°C</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ideal rentang 24 - 28°C</span>
          </div>
        </div>
      </div>

      {/* 3. OKSIGEN TERLARUT DO (Matching Running Projects 12 in Donezo) */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Oksigen Terlarut (DO)
          </span>
          <Link
            href="/ecosystem"
            className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] group-hover:text-[#111827] group-hover:border-[#111827] transition-colors"
            title="Aliran Aerasi"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {formattedDO}
            <span className="text-base font-normal text-[#9CA3AF] ml-1">mg/L</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <ShieldCheck className="h-3 w-3" />
            <span>Kaya oksigen untuk Nila L3</span>
          </div>
        </div>
      </div>

      {/* 4. KADAR pH & TDS (Matching Pending Project 2 in Donezo) */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Kadar pH & Nutrisi
          </span>
          <Link
            href="/analytics"
            className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] group-hover:text-[#111827] group-hover:border-[#111827] transition-colors"
            title="Analitik pH"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {formattedPH}
            <span className="text-base font-normal text-[#9CA3AF] ml-1">pH</span>
          </div>
          <div className="mt-2 text-[10px] text-[#4B5563] font-mono">
            TDS <span className="font-bold text-[#111827]">{formattedTDS} ppm</span> • Buffer Stabil
          </div>
        </div>
      </div>
    </div>
  );
}
