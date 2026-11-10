"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Sun,
  ThermometerSun,
  Waves,
  Bot,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { SensorSource } from "@/lib/types";

function SourceMicroBadge({ source }: { source: SensorSource }) {
  const isLive = source === "live_iot";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wide ${
        isLive
          ? "bg-[#DCFCE7] text-[#166534] border border-[#165B39]/25"
          : "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]"
      }`}
    >
      {isLive && <span className="h-1.5 w-1.5 rounded-full bg-[#165B39] animate-pulse" />}
      {isLive ? "Live ESP32" : "Auto-Dummy"}
    </span>
  );
}

export function MetricCardsRow() {
  const { sensors, sensorSources, systemMeta } = useTelemetry();

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
  const formattedLevel =
    typeof sensors.waterLevel === "number"
      ? sensors.waterLevel.toFixed(1)
      : sensors.waterLevel;

  const isLdrLive = sensorSources.lightIntensity === "live_iot";
  const luxLabel =
    sensors.lightIntensity < 300
      ? "Redup (Butuh Grow Light)"
      : sensors.lightIntensity >= 1200
      ? "Terang Optimal"
      : "Cukup Fotosintesis";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. THE INVERTED HERO ANCHOR CARD */}
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
              <span>
                {systemMeta.liveSensorCount > 0
                  ? `Hybrid IoT (${systemMeta.liveSensorCount} Live Sensor)`
                  : "+4.2% Seimbang • Auto-Dummy"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. SUHU AIR KOLAM */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#111827] block">
                Suhu Air Kolam
              </span>
              <SourceMicroBadge source={sensorSources.waterTemperature} />
            </div>
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

        {/* 3. OKSIGEN TERLARUT DO */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#111827] block">
                Oksigen Terlarut (DO)
              </span>
              <SourceMicroBadge source={sensorSources.dissolvedOxygen} />
            </div>
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

        {/* 4. KADAR pH & TDS */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#111827] block">
                Kadar pH & Nutrisi
              </span>
              <SourceMicroBadge source={sensorSources.ph} />
            </div>
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

      {/* Hybrid IoT & LDR Physical Sensor Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Highlighted LDR Light Sensor */}
        <div
          className={`rounded-[20px] border px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
            isLdrLive
              ? "bg-[#DCFCE7]/40 border-[#165B39]/35 shadow-2xs"
              : "bg-white border-[#E5E7EB]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <Sun className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#111827] truncate">
                  Cahaya LDR
                </span>
                <SourceMicroBadge source={sensorSources.lightIntensity} />
              </div>
              <div className="text-sm font-bold text-[#111827] num-tabular">
                {formattedLux} <span className="text-[11px] font-normal text-[#6B7280]">lux</span>
                <span className="text-[10px] font-normal text-[#6B7280] ml-1.5">• {luxLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Air Temp & Humidity */}
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <ThermometerSun className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#111827]">Iklim Mikro</span>
                <SourceMicroBadge source={sensorSources.airTemperature} />
              </div>
              <div className="text-sm font-bold text-[#111827] num-tabular">
                {formattedAirTemp}°C <span className="text-[11px] font-normal text-[#6B7280]">• RH {formattedHumidity}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sump Water Level */}
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#ECFDF5] text-[#165B39] flex items-center justify-center shrink-0">
              <Waves className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#111827]">Level Sump (L1)</span>
                <SourceMicroBadge source={sensorSources.waterLevel} />
              </div>
              <div className="text-sm font-bold text-[#111827] num-tabular">
                {formattedLevel}%{" "}
                <span className="text-[10px] font-normal text-[#166534]">
                  {sensors.waterLevel > 25 ? "• Aman Dry-Run" : "• Kritis!"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct AgriBot Copilot Shortcut */}
        <Link
          href="/agribot"
          className="rounded-[20px] bg-white border border-[#E5E7EB] hover:border-[#165B39]/50 hover:bg-[#DCFCE7]/25 px-4 py-3 flex items-center justify-between gap-3 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#165B39] text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#111827] block">
                AgriBot Gemini Copilot
              </span>
              <span className="text-[11px] text-[#165B39] font-medium">
                Diagnosis & Prediksi Panen →
              </span>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#165B39] transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
}
