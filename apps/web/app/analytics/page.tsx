"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { ScientificInsightsGrid } from "@/components/analytics/ScientificInsightsGrid";
import { RevealOnView } from "@/components/motion/RevealOnView";

export default function AnalyticsPage() {
  const { history, sensors, backendConnected, systemMeta } = useTelemetry();

  const hasPh = typeof sensors.ph === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasAnyWaterSensor = hasPh || hasWaterTemp || hasTds;

  // Dynamic WQI score computed from active physical sensors (pH, Water Temp, TDS)
  const tdsPenalty = hasTds
    ? (sensors.tds as number) < 400
      ? (400 - (sensors.tds as number)) * 0.03
      : (sensors.tds as number) > 800
      ? ((sensors.tds as number) - 800) * 0.03
      : 0
    : 0;
  const wqiScore = hasAnyWaterSensor
    ? Math.max(
        50,
        Math.min(
          98,
          Math.round(
            100 -
              (hasPh ? Math.abs((sensors.ph as number) - 7.0) * 16 : 0) -
              (hasWaterTemp ? Math.abs((sensors.waterTemperature as number) - 24.5) * 2.5 : 0) -
              tdsPenalty
          )
        )
      )
    : null;

  const formattedTemp = hasWaterTemp
    ? (sensors.waterTemperature as number).toFixed(1)
    : "--";
  const formattedTDS = hasTds ? Math.round(sensors.tds as number) : "--";
  const formattedPH = hasPh ? (sensors.ph as number).toFixed(2) : "--";

  const isPhOptimal =
    hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5;
  const isTempOptimal =
    hasWaterTemp &&
    (sensors.waterTemperature as number) >= 22 &&
    (sensors.waterTemperature as number) <= 27;
  const isTdsOptimal =
    hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800;

  return (
    <div className="space-y-6">
      {/* 1. Header with Sample Counter & Export */}
      <AnalyticsHeader />

      {/* ===================================================================
          2. SCIENTIFIC TELEMETRY STUDIO HUD (Typography-First, Zero Fluff)
          =================================================================== */}
      <div className="rounded-[20px] bg-[#0F291E] text-white p-5 sm:p-6 shadow-sm border border-[#165B39]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  systemMeta.edgeOnline && systemMeta.liveSensorCount > 0
                    ? "bg-[#68C194]"
                    : "bg-[#9CA3AF]"
                }`}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#68C194]">
                LABORATORY DATA STUDIO &bull;{" "}
                {systemMeta.liveSensorCount > 0
                  ? `${systemMeta.liveSensorCount} SENSOR ESP32 LIVE`
                  : "MENUNGGU TELEMETRI ESP32"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Studio Deret Waktu &amp; Analisis Korelasi Bioproses
            </h2>
            <p className="text-xs text-white/75 max-w-2xl leading-relaxed">
              Memetakan fluktuasi 6 parameter fisik ESP32 secara sinkron (frekuensi 5.000 ms) untuk menguji keseimbangan termal, serapan nutrisi nitrat, dan kestabilan akuaponik adaptif iklim.
            </p>
          </div>

          {/* Integrated Real-time Analytics HUD */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono text-xs">
            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <div className="text-[9.5px] uppercase tracking-wider text-white/50">Water Quality Index</div>
              <div className="font-bold text-[#68C194] text-sm num-tabular mt-0.5">
                {wqiScore !== null ? `${wqiScore} / 100` : "-- / 100"}{" "}
                <span className="text-[10px] text-white/60 font-normal">
                  {wqiScore !== null ? "Terukur" : "Offline"}
                </span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <div className="text-[9.5px] uppercase tracking-wider text-white/50">Buffer Tersimpan</div>
              <div className="font-bold text-white text-sm num-tabular mt-0.5">
                {history.length} Sampel
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <div className="text-[9.5px] uppercase tracking-wider text-white/50">Interval Pulse</div>
              <div className="font-bold text-[#F59E0B] text-sm num-tabular mt-0.5">
                5.0 detik
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          3. HERO INTERACTIVE MULTI-METRIC SPLINE TIME-SERIES CHART
          =================================================================== */}
      <RevealOnView delayMs={0}>
        <TimeSeriesChart history={history} sensors={sensors} />
      </RevealOnView>

      {/* ===================================================================
          4. ASYMMETRIC ANALYTICAL LOWER DECK:
             LEFT (60%): SCIENTIFIC BIOPROCESS INSIGHTS
             RIGHT (40%): CHEMICAL EQUILIBRIUM & AUDIT DECK
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCIENTIFIC INSIGHTS */}
        <div className="lg:col-span-7">
          <ScientificInsightsGrid />
        </div>

        {/* RIGHT COLUMN: WATER CHEMISTRY & SYSTEM EQUILIBRIUM AUDITOR */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Water Chemistry Balance Card */}
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#165B39] uppercase tracking-wider block">
                  Audit Keseimbangan
                </span>
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide mt-0.5">
                  Neraca Kimiawi Air (ECAD Audit)
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  !hasAnyWaterSensor
                    ? "bg-[#F3F4F6] text-[#4B5563]"
                    : isPhOptimal && isTdsOptimal && isTempOptimal
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#FEF3C7] text-[#B45309]"
                }`}
              >
                {!hasAnyWaterSensor
                  ? "OFFLINE"
                  : isPhOptimal && isTdsOptimal && isTempOptimal
                  ? "STABIL"
                  : "PANTAU"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-[#111827] block text-[11px] font-sans">pH Buffer Index</span>
                  <span className="text-[10px] text-[#6B7280]">Nilai: {formattedPH} pH</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${!hasPh ? "text-[#6B7280]" : "text-[#166534]"}`}>
                    {!hasPh ? "Sensor Offline" : isPhOptimal ? "Optimal (6.5 - 7.5)" : "Buffer Check"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-[#111827] block text-[11px] font-sans">TDS Nutrisi Terlarut</span>
                  <span className="text-[10px] text-[#6B7280]">Kepekatan: {formattedTDS} ppm</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${!hasTds ? "text-[#6B7280]" : "text-[#D97706]"}`}>
                    {!hasTds ? "Sensor Offline" : isTdsOptimal ? "Ideal (400 - 800)" : "Atur Pakan"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-[#111827] block text-[11px] font-sans">Suhu Air Kolam (DS18B20)</span>
                  <span className="text-[10px] text-[#6B7280]">Temperatur: {formattedTemp} °C</span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold block ${
                      !hasWaterTemp
                        ? "text-[#6B7280]"
                        : isTempOptimal
                        ? "text-[#166534]"
                        : "text-[#D97706]"
                    }`}
                  >
                    {!hasWaterTemp ? "Sensor Offline" : isTempOptimal ? "Optimal (22 - 27°C)" : "Pantau Suhu"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ingestion Pipeline & Connection Monitor */}
          <div className="rounded-[20px] bg-[#0B2C1B] text-white p-5 shadow-xs space-y-2.5 border border-[#165B39]/50">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-xs">
              <span className="font-bold text-[#68C194] uppercase tracking-wider text-[10px]">
                Pipeline Status
              </span>
              <span
                className={`text-[10.5px] font-semibold ${
                  backendConnected && systemMeta.edgeOnline
                    ? "text-[#68C194]"
                    : "text-white/75"
                }`}
              >
                {backendConnected
                  ? systemMeta.edgeOnline
                    ? `ESP32 Live (${systemMeta.edgeNode})`
                    : "API Live • ESP32 Offline"
                  : "Connecting API..."}
              </span>
            </div>

            <p className="text-xs text-white/75 leading-relaxed">
              Data telemetri streaming disinkronkan secara kontinu dari ESP32 menuju server ElysiaJS dan di-cache dalam buffer SQLite deret waktu.
            </p>

            <div className="pt-2 flex items-center justify-between text-xs">
              <Link
                href="/ecosystem"
                className="font-bold text-[#68C194] hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Periksa Menara Kaskade</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
              <span className="text-[10px] font-mono text-white/40">
                HTTPS API &bull; WS /api/telemetry/ws
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
