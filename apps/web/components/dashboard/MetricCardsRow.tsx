"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Sun,
  ThermometerSun,
  Bot,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function MetricCardsRow() {
  const { sensors, systemMeta } = useTelemetry();

  // Dynamic WQI score computed from active physical sensors (pH, Water Temp, TDS, LDR)
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
  const formattedPH =
    typeof sensors.ph === "number"
      ? sensors.ph.toFixed(2)
      : sensors.ph;
  const formattedTDS =
    typeof sensors.tds === "number"
      ? Math.round(sensors.tds)
      : sensors.tds;
  const formattedLux =
    typeof sensors.lightIntensity === "number"
      ? Math.round(sensors.lightIntensity)
      : sensors.lightIntensity;
  const formattedAirTemp =
    typeof sensors.airTemperature === "number"
      ? sensors.airTemperature.toFixed(1)
      : sensors.airTemperature;
  const formattedHumidity =
    typeof sensors.humidity === "number"
      ? sensors.humidity.toFixed(0)
      : sensors.humidity;

  const luxLabel =
    sensors.lightIntensity < 300
      ? "Redup (Butuh Grow Light)"
      : sensors.lightIntensity >= 1200
      ? "Terang Optimal"
      : "Cukup Fotosintesis";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. THE INVERTED HERO ANCHOR CARD */}
        <Link
          href="/analytics"
          className="rounded-[24px] bg-[#165B39] hover:bg-[#145233] text-white p-5 shadow-xs flex flex-col justify-between h-[164px] relative overflow-hidden transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">
              Kualitas Air (WQI)
            </span>
            <span
              className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] transition-colors"
              title="Detail WQI"
            >
              <ArrowUpRight className="h-4 w-4 stroke-[2.25] transition-transform duration-200 group-hover:rotate-45" />
            </span>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-white">
              {wqiScore}<span className="text-xl font-normal text-white/80">%</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
              <TrendingUp className="h-3 w-3 text-[#68C194]" />
              <span>
                {systemMeta.edgeOnline
                  ? `Node ${systemMeta.edgeNode} • Real-Time`
                  : "+4.2% Bioproses Seimbang • Live"}
              </span>
            </div>
          </div>
        </Link>

        {/* 2. SUHU AIR KOLAM */}
        <Link
          href="/ecosystem"
          className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[164px] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827] block">
              Suhu Air Kolam
            </span>
            <span
              className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] group-hover:text-[#111827] group-hover:border-[#D1D5DB] transition-colors"
              title="Detail Ekosistem"
            >
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45" />
            </span>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              {formattedTemp}
              <span className="text-xl font-normal text-[#9CA3AF]">°C</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
              <CheckCircle2 className="h-3 w-3" />
              <span>Ideal rentang 24 - 28°C</span>
            </div>
          </div>
        </Link>

        {/* 3. KADAR pH & TDS */}
        <Link
          href="/analytics"
          className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[164px] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827] block">
              Kadar pH &amp; Nutrisi
            </span>
            <span
              className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] group-hover:text-[#111827] group-hover:border-[#D1D5DB] transition-colors"
              title="Analitik pH"
            >
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45" />
            </span>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              {formattedPH}
              <span className="text-base font-normal text-[#9CA3AF] ml-1">pH</span>
            </div>
            <div className="mt-2 text-[10px] text-[#4B5563] font-mono">
              TDS <span className="font-bold text-[#111827]">{formattedTDS} ppm</span> • Buffer Stabil
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Telemetry & AgriBot Shortcut Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* LDR Light Sensor (Clean White Card) */}
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] px-4 py-3 flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <Sun className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#111827] block truncate">
                Cahaya LDR
              </span>
              <div className="text-sm font-bold text-[#111827] num-tabular">
                {formattedLux} <span className="text-[11px] font-normal text-[#6B7280]">lux</span>
                <span className="text-[10px] font-normal text-[#6B7280] ml-1.5">• {luxLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Air Temp & Humidity */}
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] px-4 py-3 flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <ThermometerSun className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#111827] block">
                Iklim Mikro
              </span>
              <div className="text-sm font-bold text-[#111827] num-tabular">
                {formattedAirTemp}°C <span className="text-[11px] font-normal text-[#6B7280]">• RH {formattedHumidity}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct AgriBot Copilot Shortcut */}
        <Link
          href="/agribot"
          className="rounded-[20px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] px-4 py-3 flex items-center justify-between gap-3 transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#165B39] text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#111827] block truncate">
                AgriBot Gemini Copilot
              </span>
              <span className="text-[11px] text-[#165B39] font-medium block truncate">
                Diagnosis &amp; Prediksi Panen
              </span>
            </div>
          </div>
          <span className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] group-hover:text-[#111827] group-hover:border-[#D1D5DB] transition-colors shrink-0">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45" />
          </span>
        </Link>
      </div>
    </div>
  );
}
